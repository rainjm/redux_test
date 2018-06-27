/**
 * 每当store.dispatch发送过来一个新的 Action，就会自动调用 Reducer，得到新的 State。
 * 以下都是 Action 指令对应的规则，跟进定义的规则，重新生成 State
 * 
 * 生成 Store 的时候，将 Reducer 传入createStore方法
 * 见 ./src/index.js 首部 :
 * 
 * import reducer from './reducers'
 * const store = createStore(
 *   reducer,
 *   applyMiddleware(...middleware)
 * )
 * 
 */
import { combineReducers } from 'redux'
import {
  SELECT_SUBREDDIT,
  REQUEST_POSTS,
  RECEIVE_POSTS,
  INVALIDATE_SUBREDDIT
} from '../actions'

/**
 * 
 * Picker 选择控件
 * 
 * @param {*} state 
 * @param {*} action 
 */
const selectedSubreddit = (state = 'reactjs', action) => {
  switch (action.type) {
    case SELECT_SUBREDDIT:
      return action.subreddit
    default:
      return state
  }
}

const posts = (state = {
  isFetching: false,
  didInvalidate: false,
  items: []
}, action) => {
  switch (action.type) {
    case INVALIDATE_SUBREDDIT:
      return {
        ...state,
        didInvalidate: true // 更新
      }
    case REQUEST_POSTS:
      return {
        ...state,
        isFetching: true,
        didInvalidate: false
      }
    case RECEIVE_POSTS:
      return {
        ...state,
        isFetching: false,
        didInvalidate: false,
        items: action.posts,
        lastUpdated: action.receivedAt
      }
    default:
      return state
  }
}

/**
 * 
 * @param {*} state 
 * @param {*} action 
 * 
 * @return 
 * 
 * { 
 *    postsBySubreddit: {
 *      reactjs: {…},
 *      frontend: {…}
 *    },
 *    selectedSubreddit : "frontend"
 * }
 */
const postsBySubreddit = (state = { }, action) => {
  switch (action.type) {
    case INVALIDATE_SUBREDDIT:
    case RECEIVE_POSTS: // 
    case REQUEST_POSTS:
      return {
        ...state,
        [action.subreddit]: posts(state[action.subreddit], action)  // 
      }
    default:
      return state
  }
}

/**
 * combineReducers方法，用于 Reducer 的拆分。你只要定义各个子 Reducer 函数，然后用这个方法，将它们合成一个大的 Reducer。
 * 这种写法有一个前提，就是 State 的属性名必须与子 Reducer 同名。如果不同名，就要采用下面的写法。
 * combineReducers()做的就是产生一个整体的 Reducer 函数。
 * 该函数根据 State 的 key 去执行相应的子 Reducer，并将返回结果合并成一个大的 State 对象。
 * http://www.ruanyifeng.com/blog/2016/09/redux_tutorial_part_one_basic_usages.html
 * 
 * 组件通过 this.props 取到属性，const { dispatch, postsBySubreddit， selectedSubreddit } = this.props
 */
const rootReducer = combineReducers({
  postsBySubreddit, // 例：postsBySubreddit: {reactjs: {…}, frontend: {…}} 或 postsBySubreddit: {frontend: {…}}
  selectedSubreddit // 例：selectedSubreddit : "frontend" 或 selectedSubreddit : "reactjs"
})

export default rootReducer
