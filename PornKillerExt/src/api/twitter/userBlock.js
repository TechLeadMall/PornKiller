import request from '@/utils/request'

// 查询用户禁黄推操作列表
export function listUserBlock(query) {
  return request({
    url: '/twitter/userBlock/list',
    method: 'get',
    params: query
  })
}

// 查询用户禁黄推操作详细
export function getUserBlock(id) {
  return request({
    url: '/twitter/userBlock/' + id,
    method: 'get'
  })
}

// 新增用户禁黄推操作
export function addUserBlock(data) {
  return request({
    url: '/twitter/userBlock',
    method: 'post',
    data: data
  })
}

// 修改用户禁黄推操作
export function updateUserBlock(data) {
  return request({
    url: '/twitter/userBlock',
    method: 'put',
    data: data
  })
}

// 删除用户禁黄推操作
export function delUserBlock(id) {
  return request({
    url: '/twitter/userBlock/' + id,
    method: 'delete'
  })
}
