/**
 * React-Redux 将所有组件分成两大类：UI 组件（presentational component）和容器组件（container component）。
 * 
 * UI组件:
 * 只负责 UI 的呈现，不带有任何业务逻辑
 * 没有状态（即不使用this.state这个变量）
 * 所有数据都由参数（this.props）提供
 * 不使用任何 Redux 的 API
 * 
 * 容器组件:
 * 负责管理数据和业务逻辑，不负责 UI 的呈现
 * 带有内部状态
 * 使用 Redux 的 API
 * 
 * UI 组件负责 UI 的呈现，容器组件负责管理数据和逻辑。
 * 
 */

import React from 'react';
import ReactDOM from 'react-dom';
import { createStore, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import { logger } from 'redux-logger'

import reducer from './reducers'
import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';

const middleware = [thunk]
if (process.env.NODE_ENV !== 'production') {
  middleware.push(logger)
}

/**
 * 创建store
 */
const store = createStore(
  reducer,
  {
    selectedSubreddit : "frontend"  // 会覆盖 reducer 的 state 默认值，例： state = 'reactjs'。通常在获取服务器保存的数据进行写入，作为APP基础数据
  },
  applyMiddleware(...middleware)  // Redux 的原生方法，作用是将所有中间件组成一个数组, 可以拿到getState和dispatch这两个方法
)

ReactDOM.render(
  // 
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
);
registerServiceWorker();
