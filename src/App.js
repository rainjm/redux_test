import React, { Component } from 'react';
import { connect } from 'react-redux';

import logo from './logo.svg';
import './App.css';
import { 
  selectSubreddit,
  fetchPostsIfNeeded, // 触发请求数据
  invalidateSubreddit,
} from './actions'
import Picker from './components/Picker';
import Posts from './components/Posts';


class App extends Component {

  componentDidMount() {
    const { dispatch, selectedSubreddit } = this.props
    dispatch(fetchPostsIfNeeded(selectedSubreddit))
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.selectedSubreddit !== this.props.selectedSubreddit) {
      const { dispatch, selectedSubreddit } = nextProps
      dispatch(fetchPostsIfNeeded(selectedSubreddit))
    }
  }

  handleChange = nextSubreddit => {
    /**
     * 1)用户发出 Action
     * 2)Store 自动调用 Reducer，并且传入两个参数：当前 State 和收到的 Action。 Reducer 会返回新的 State 
     * 3)State 一旦有变化，Store 就会调用监听函数 store.subscribe(listener),触发重新渲染 View;
     * 
     * function listerner() {
     *    let newState = store.getState();
     *    component.setState(newState);   
     *  }
     * 
     */
    this.props.dispatch(selectSubreddit(nextSubreddit))
  }

  handleRefreshClick = e => {
    e.preventDefault()

    const { dispatch, selectedSubreddit } = this.props
    dispatch(invalidateSubreddit(selectedSubreddit))
    dispatch(fetchPostsIfNeeded(selectedSubreddit))
  }


  render() {
    const { selectedSubreddit, posts, isFetching, lastUpdated } = this.props
    const options = [ 'reactjs', 'frontend' ]
    const isEmpty = posts.length === 0
    return (
      <div>
        <Picker value={selectedSubreddit} onChange={this.handleChange} options={options}  />

        <p>
          {lastUpdated &&
            <span>
              Last updated at {new Date(lastUpdated).toLocaleTimeString()}.
              {' '}
            </span>
          }
          {!isFetching &&
            <button onClick={this.handleRefreshClick}>
              Refresh
            </button>
          }
        </p>

        {isEmpty
          ? (isFetching ? <h2>Loading...</h2> : <h2>Empty.</h2>)
          : <div style={{ opacity: isFetching ? 0.5 : 1 }}>
              <Posts posts={posts} />
            </div>
        }

      </div>
    );
  }
}

/**
 * 定义业务逻辑
 * 
 * 输入逻辑：外部的数据（即state对象）如何转换为 UI 组件的参数 [即将state映射到 UI 组件的参数（props）]
 * 输出逻辑：用户发出的动作如何变为 Action 对象，从 UI 组件传出去。 [即将用户对 UI 组件的操作映射成 Action]
 * 
 */

/**
 * 输入逻辑
 * 
 * mapStateToProps是一个函数。它的作用就是像它的名字那样，建立一个从（外部的）state对象到（UI 组件的）props对象的映射关系
 * mapStateToProps执行后应该返回一个对象，里面的每一个键值对就是一个映射
 * 这个对象有一个 selectedSubreddit 属性, 代表 UI 组件的同名参数
 * 
 * @param {Object} state 
 */
const mapStateToProps = state => {
  const { selectedSubreddit, postsBySubreddit } = state
  const {
    isFetching,
    lastUpdated,
    items: posts
  } = postsBySubreddit[selectedSubreddit] || {
    isFetching: true,
    items: []
  }

  return {
    selectedSubreddit,
    posts,
    isFetching,
    lastUpdated
  }
}

/**
 * React-Redux 提供connect方法，用于从 UI 组件生成容器组件。connect的意思，就是将这两种组件连起来。
 * 
 * App 是 UI 组件，VisibleApp 就是由 React-Redux 通过connect方法自动生成的容器组件。
 * 
 */
const VisibleApp = connect(mapStateToProps)(App);
export default VisibleApp;
