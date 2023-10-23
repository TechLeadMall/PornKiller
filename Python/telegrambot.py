import logging

import asyncio
import json
import websockets
import requests # http请求
import json # json数据格式
from websockets.legacy.server import WebSocketServerProtocol
import redis
from threading import Timer

r = redis.StrictRedis(host='localhost', port=6379, db=0)
from telegram import (
    KeyboardButton,
    KeyboardButtonPollType,
    Poll,
    ReplyKeyboardMarkup,
    ReplyKeyboardRemove,
    Update,
)
from telegram.constants import ParseMode
from telegram.ext import (
    Application,
    ApplicationBuilder,
    CommandHandler,
    ContextTypes,
    CallbackContext,
    MessageHandler,
    PollAnswerHandler,
    PollHandler,
    filters,
)
import pickle
import threading
import nest_asyncio
from datetime import timedelta

from datetime import datetime

from telegram.ext._callbackcontext import CallbackContext

BASE_URL = "https://twitter.cyberworld.win/server/"
CHAT_ID = -1001858815856                #群聊ID

TOTAL_VOTER_COUNT = 6                  #投票数

nest_asyncio.apply()
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)

CONNECTIONS = set()
botContextMap ={}
globalContext = {}

redisClient = redis.StrictRedis(host='localhost', port=6379, db=0)


#删除telegram群组信息
async def deleteMsg( context: ContextTypes.DEFAULT_TYPE,chatId:str, messageId: str, secondNum):
    await asyncio.sleep(secondNum)
    await context.bot.deleteMessage(chatId, messageId) 
async def deleteTwoMsg(context: ContextTypes.DEFAULT_TYPE,chatId:str, messageId1: str,messageId2: str, secondNum):
    await asyncio.sleep(secondNum)
    # context = botContextMap[url]['context'] 
    await context.bot.deleteMessage(chatId, messageId1) 
    await context.bot.deleteMessage(chatId, messageId2) 

async def receive_poll_answer(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Summarize a users poll vote"""

    answer = update.poll_answer
    answered_poll_pickle = redisClient.get("botData:"+answer.poll_id)
    answered_poll = pickle.loads(answered_poll_pickle)

    # answered_poll = context.bot_data[answer.poll_id]
    try:
        questions = answered_poll["questions"]
    # this means this poll answer update is from an old poll, we can't do our answering then
    except KeyError:
        return
    selected_options = answer.option_ids
    answer_string = ""
    for question_id in selected_options:
        if question_id != selected_options[-1]:
            answer_string += questions[question_id] + " and "
        else:
            answer_string += questions[question_id]
    

    answered_poll["answers"] += 1
    answered_poll["vote"]["message_id"] = answered_poll['message_id']
    user = {}
    user['first_name'] = update.effective_user['first_name']
    user['id'] = update.effective_user['id']
    user['last_name'] = update.effective_user['last_name']
    user['full_name'] = update.effective_user['full_name']
    user['name'] = update.effective_user['name']
    answered_poll["vote"]["list"].append({"user":user,"answer":answer_string})
    #存储投票信息
    redisClient.set("botData:"+answer.poll_id,pickle.dumps(answered_poll))                 

   
    #判定投票结束条件
    if answered_poll["answers"] >= TOTAL_VOTER_COUNT:
        followCount = answered_poll["vote"]['twitter_user']['userItem']['followers_count']
        needCountNum = (followCount / 400000)*(followCount / 400000) * 20
        if followCount<=400000 or (followCount>400000 and answered_poll["answers"] >= needCountNum):
            await context.bot.stop_poll(answered_poll["chat_id"], answered_poll["message_id"])
            
            
            loop=asyncio.get_event_loop()
            loop.create_task(deleteMsg(context, answered_poll["chat_id"], answered_poll["message_id"],60))

            if 'orginal_message_id' in answered_poll:
                loop.create_task(deleteMsg(context, answered_poll["chat_id"], answered_poll["orginal_message_id"],60))
            # deleteMsgTimer = Timer(10, deleteTwoMsg,(context, answered_poll["chat_id"], answered_poll["message_id"],answered_poll["orginal_message_id"]))
            # deleteMsgTimer.start()
            data = answered_poll["vote"]
            result = await addVoteInfo(data)
            # print(result)
            # print(result.text)
            data = json.loads(result.text)
            message = await context.bot.send_message(
                answered_poll["chat_id"],
                answered_poll["vote"]['twitter_user']['userItem']['name']+data['msg'],
                parse_mode=ParseMode.HTML,
            )
            
            loop.create_task(deleteMsg(context, answered_poll["chat_id"], message.message_id,600))


async def addVoteInfo(data):

    # 需要发送http请求的url地址
    url = BASE_URL+"twitter/userVote/addVoteInfo" 
    # 设置header
    headers = {'content-type': "application/json"} 
    # json数据
    body = data
    dataStr = json.dumps(body)
    response = requests.post(url, data = dataStr, headers = headers)
    
    print(response)
    return response

async def isExistVoteHttp(data):

    # 需要发送http请求的url地址
    url = BASE_URL+"twitter/userVote/isExistVote" 
    # 设置header
    headers = {'content-type': "application/json"} 
    # json数据
    body = data
    dataStr = json.dumps(body)
    response = requests.post(url, data = dataStr, headers = headers)
    
    print(response)
    return response

async def receive_poll(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """On receiving polls, reply to it by a closed poll copying the received poll"""
    actual_poll = update.effective_message.poll
    # Only need to set the question and options, since all other parameters don't matter for
    # a closed poll
    await update.effective_message.reply_poll(
        question=actual_poll.question,
        options=[o.text for o in actual_poll.options],
        # with is_closed true, the poll/quiz is immediately closed
        is_closed=True,
        reply_markup=ReplyKeyboardRemove(),
    )


async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await context.bot.send_message(chat_id=update.effective_chat.id, text="I'm a bot, please talk to me!")
async def confirm(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if (update.effective_chat.id == CHAT_ID ):
        if len(update.message.text)>8:
            url = update.message.text[9:]
            websockets.broadcast(CONNECTIONS, url)
            botContextMap[url] = {"confirm":True,"context":context,"update":update}
async def echo(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if (update.effective_chat.id == CHAT_ID ):
        # global staticContext
        # global staticUpdate
        # staticContext = context
        # staticUpdate = update
        # redisClient.set("staticBot",pickle.dumps(staticContext.bot))
        websockets.broadcast(CONNECTIONS, update.message.text)


        botContextMap[update.message.text] = {"context":context, "tel_message": update.message,
                                  "effective_user": update.effective_user}

    

async def caps(update: Update, context: ContextTypes.DEFAULT_TYPE):
    text_caps = ' '.join(context.args).upper()
    await context.bot.send_message(chat_id=update.effective_chat.id, text=text_caps)


#获取twitter用户信息，发起投票

async def ws_handle(websocket: WebSocketServerProtocol, path: str):
    CONNECTIONS.add(websocket)
    
    async for message in websocket:
        jsonmsg = json.loads(message)
        
        if ('isFromTwitter' in jsonmsg and jsonmsg['isFromTwitter'] == True):
            # CallbackContext()
            # context = staticContext
            # update =  staticUpdate

            urlText = 'https://x.com/' + jsonmsg['userItem']['screen_name'][1:]
            originMessage = await globalContext.bot.send_message(
                    CHAT_ID,
                    urlText+" 由推友"+jsonmsg['twitterName']+"发起，初步认为它是"+jsonmsg['kind'],
                    parse_mode=ParseMode.HTML
            )
            effective_user = {'id':"twitter"}
            botContextMap[urlText] = {"context": globalContext, "tel_message": originMessage,"effective_user": effective_user, "twitter_create_by":jsonmsg['twitterUserId']}
            jsonmsg['url'] = urlText
            
        context = botContextMap[jsonmsg['url']]['context']
        tel_message = botContextMap[jsonmsg['url']]['tel_message']
        effective_user = botContextMap[jsonmsg['url']]['effective_user']
        if 'twitter_create_by' in botContextMap[jsonmsg['url']]:
            twitter_create_by = botContextMap[jsonmsg['url']]['twitter_create_by']
        else:
            twitter_create_by = None
        questions = [ "我觉得它是垃圾引流账户。", "我觉得它是疑似诈骗黄推。", "我觉得它是普通黄推。","我觉得它不是黄推,请移入白名单。"]
        hasCreatePoll = True
        if ('confirm' in botContextMap[jsonmsg['url']] and botContextMap[jsonmsg['url']]['confirm'] == True):
            
            message = await context.bot.send_poll(
                CHAT_ID,
                '请对'+jsonmsg['userItem']['name']+'投票表决。',
                questions,
                is_anonymous=False,
                allows_multiple_answers=False
            )

        else:
            result = await isExistVoteHttp(jsonmsg['userItem'])
            data = json.loads(result.text)
            if (data['code']== 200):
                message = await context.bot.send_poll(
                    CHAT_ID,
                    '请对'+jsonmsg['userItem']['name']+'投票表决。',
                    questions,
                    is_anonymous=False,
                    allows_multiple_answers=False
                )
            else:
                message = await context.bot.send_message(
                    CHAT_ID,
                    data['msg'],
                    parse_mode=ParseMode.HTML
                )
                loop=asyncio.get_event_loop()
                loop.create_task(deleteTwoMsg(context, CHAT_ID,message.message_id,tel_message.id,15))

                hasCreatePoll = False
        
        # Save some info about the poll the bot_data for later use in receive_poll_answer
        if hasCreatePoll :
            payload = {
                message.poll.id: {
                    "questions": questions,
                    "message_id": message.message_id,
                    "orginal_message_id": tel_message.id,
                    "chat_id": CHAT_ID,
                    "answers": 0,
                    "vote":{
                        "twitter_user": jsonmsg,
                        "list":[],
                        "creator": effective_user['id'],
                        "twitter_create_by":twitter_create_by

                    }
                }
            }
            
            redisClient.set("botData:"+message.poll.id,pickle.dumps(payload[message.poll.id]))
    try:
        await websocket.wait_closed()
    finally:
        CONNECTIONS.remove(websocket)
    


    # 线程执行的代码
async def websocket():
    await websockets.serve(ws_handle, "localhost", 8765)




async def bot():
    #设置机器人token
    application = ApplicationBuilder().token('设置机器人token').build()
    

    global globalContext
    globalContext = CallbackContext(application,CHAT_ID)
    echo_handler = MessageHandler(filters.TEXT & (filters.Entity("url") | filters.Entity("text_link"))
, echo)
    
    # start_handler = CommandHandler('start', start)
    confirm_handler = CommandHandler('confirm', confirm)

    # application.add_handler(start_handler)
    application.add_handler(confirm_handler)
    application.add_handler(echo_handler)
    
    application.add_handler(MessageHandler(filters.POLL, receive_poll))
    application.add_handler(PollAnswerHandler(receive_poll_answer))
    application.run_polling(allowed_updates=Update.ALL_TYPES)

if __name__ == '__main__':
    
    # Run the bot until the user presses Ctrl-C
    tasks = [asyncio.Task(bot()),
             asyncio.Task(websocket())]
    loop = asyncio.get_event_loop()
    loop.run_until_complete(asyncio.wait(tasks))
    loop.close()



