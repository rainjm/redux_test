/**
 * State 的变化，会导致 View 的变化。但是，用户接触不到 State，只能接触到 View。
 * 所以，State 的变化必须是 View 导致的。
 * Action 就是 View 发出的通知，表示 State 应该要发生变化了。
 * Action 是一个对象。其中的 type 属性是必须的，表示 Action 的名称。
 */

export const REQUEST_POSTS = 'REQUEST_POSTS'  // 发起请求
export const RECEIVE_POSTS = 'RECEIVE_POSTS'  // 接受请求
export const SELECT_SUBREDDIT = 'SELECT_SUBREDDIT'  //
export const INVALIDATE_SUBREDDIT = 'INVALIDATE_SUBREDDIT'  //

/**
 * Picker 选择控件
 * @param {*} subreddit 
 */
export const selectSubreddit = subreddit => ({
  type: SELECT_SUBREDDIT, 
  subreddit
})

export const invalidateSubreddit = subreddit => ({
  type: INVALIDATE_SUBREDDIT,
  subreddit
})

/**
 * 发出请求
 * @param {String} subreddit API名字
 */
export const requestPosts = subreddit => ({
  type: REQUEST_POSTS,  
  subreddit
})

/**
 * 接受请求
 * @param {String} subreddit API名字
 * @param {*} json 
 */
export const receivePosts = (subreddit, json) => ({
  type: RECEIVE_POSTS,
  subreddit,
  posts: json.data.children.map(child => child.data),
  receivedAt: Date.now()
})

/**
 * fetchPosts 是一个 Action Creator（动作生成器）
 * 
 * 返回一个函数。这个函数执行后，
 * 先发出一个Action（requestPosts(subreddit)），
 * 然后进行异步操作。
 * 拿到结果后，先将结果转成 JSON 格式，
 * 然后再发出一个 Action（ receivePosts(subreddit, json)）。
 * 
 * @param {String} subreddit 
 * @return {Function} 
 */

/**
 * fetchPosts返回了一个函数，而普通的 Action Creator 默认返回一个对象。
 * 返回的函数的参数是 dispatch 和 getState 这两个 Redux 方法，普通的 Action Creator 的参数是 Action 的内容
 * 在返回的函数之中，先发出一个 Action（requestPosts(subreddit)），表示操作开始
 * 异步操作结束之后，再发出一个 Action（receivePosts(subreddit, json)），表示操作结束
 * 
 * Action 是由store.dispatch方法发送的。而store.dispatch方法正常情况下，参数只能是对象，不能是函数。
 * 这时，就要使用中间件redux-thunk
 * 使用redux-thunk中间件，改造store.dispatch，使得后者可以接受函数作为参数。
 * 
 * 异步操作的第一种解决方案就是，写出一个返回函数的 Action Creator，然后使用 redux-thunk 中间件改造 store.dispatch
 * 另一种异步操作的解决方案，就是让 Action Creator 返回一个 Promise 对象。使用【redux-promise 中间件】 http://www.ruanyifeng.com/blog/2016/09/redux_tutorial_part_two_async_operations.html
 */
const fetchPosts = subreddit => dispatch => {
  dispatch(requestPosts(subreddit))
  return fetch(`https://www.reddit.com/r/${subreddit}.json`)
    .then(response => response.json())
    .then(json => dispatch(receivePosts(subreddit, json)))
}

/**
 * 
 * @param {*} state 
 * @param {*} subreddit 
 */
const shouldFetchPosts = (state, subreddit) => {
  const posts = state.postsBySubreddit[subreddit]
  if (!posts) {
    return true
  }
  if (posts.isFetching) {
    return false
  }
  return posts.didInvalidate // 刷新
}

/**
 * 
 * @param {*} subreddit 
 */
export const fetchPostsIfNeeded = subreddit => (dispatch, getState) => {
  if (shouldFetchPosts(getState(), subreddit)) {
    return dispatch(fetchPosts(subreddit))
  }
}
