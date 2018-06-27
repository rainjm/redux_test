import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types'

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
  static propTypes = {
    selectedSubreddit: PropTypes.string.isRequired,
    posts: PropTypes.array.isRequired,
    isFetching: PropTypes.bool.isRequired,
    lastUpdated: PropTypes.number,
    dispatch: PropTypes.func.isRequired
  }

  componentDidMount() {
    const { dispatch, selectedSubreddit, mapFetchPostsIfNeeded } = this.props
    // dispatch(fetchPostsIfNeeded(selectedSubreddit)) // 不需要定义 mapDispatchToProps
    mapFetchPostsIfNeeded(selectedSubreddit); // 需要定义 mapDispatchToProps
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.selectedSubreddit !== this.props.selectedSubreddit) {
      const { dispatch, selectedSubreddit, mapFetchPostsIfNeeded } = nextProps
      // dispatch(fetchPostsIfNeeded(selectedSubreddit))
      mapFetchPostsIfNeeded(selectedSubreddit);
    }
  }

  // handleChange = nextSubreddit => {
  //   /**
  //    * 1)用户发出 Action
  //    * 2)Store 自动调用 Reducer，并且传入两个参数：当前 State 和收到的 Action。 Reducer 会返回新的 State 
  //    * 3)State 一旦有变化，Store 就会调用监听函数 store.subscribe(listener),触发重新渲染 View;
  //    * 
  //    * function listerner() {
  //    *    let newState = store.getState();
  //    *    component.setState(newState);
  //    *  }
  //    * 
  //    */
  //   this.props.dispatch(selectSubreddit(nextSubreddit))
  // }

  handleRefreshClick = e => {
    e.preventDefault()

    const { dispatch, selectedSubreddit, mapFetchPostsIfNeeded } = this.props
    dispatch(invalidateSubreddit(selectedSubreddit))
    // dispatch(fetchPostsIfNeeded(selectedSubreddit))
    mapFetchPostsIfNeeded(selectedSubreddit);
  }


  render() {
    const { selectedSubreddit, posts, isFetching, lastUpdated, handleChange } = this.props
    const options = [ 'reactjs', 'frontend' ]
    const isEmpty = posts.length === 0
    return (
      <div>
        <Picker value={selectedSubreddit} onChange={handleChange} options={options}  />

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
 * 定义业务逻辑 start
 * http://www.ruanyifeng.com/blog/2016/09/redux_tutorial_part_three_react-redux.html
 */

/**
 * 将 Redux state 映射到 组件 props
 * 输入逻辑
 * 外部的数据（即state对象）如何转换为 UI 组件的参数 
 * 
 * mapStateToProps是一个函数。它的作用就是像它的名字那样，建立一个从（外部的）state对象到（UI 组件的）props对象的映射关系
 * mapStateToProps执行后应该返回一个对象，里面的每一个键值对就是一个映射
 * 这个对象有一个 selectedSubreddit 属性, 代表 UI 组件的同名参数
 * 
 * mapStateToProps会订阅 Store，每当state更新的时候，就会自动执行，重新计算 UI 组件的参数，从而触发 UI 组件的重新渲染
 * mapStateToProps的第一个参数总是state对象，还可以使用第二个参数，代表容器组件的props对象。
 * 
 * // 容器组件的代码
 * //    <FilterLink filter="SHOW_ALL">
 * //      All
 * //    </FilterLink>
 *
 * const mapStateToProps = (state, ownProps) => {
 *   return {
 *     active: ownProps.filter === state.visibilityFilter
 *   }
 * }
 * 
 * 使用ownProps作为参数后，如果容器组件的参数发生变化，也会引发 UI 组件重新渲染。
 * connect方法可以省略mapStateToProps参数，那样的话，UI 组件就不会订阅Store，就是说 Store 的更新不会引起 UI 组件的更新。
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
 * 将 Redux actions 映射到组件 props
 * 输出逻辑
 * 用户发出的动作如何变为 Action 对象，从 UI 组件传出去。
 * 
 * mapDispatchToProps是connect函数的第二个参数，用来建立 UI 组件的参数到store.dispatch方法的映射。
 * 也就是说，它定义了哪些用户的操作应该当作 Action，传给 Store。
 * 它可以是一个函数，也可以是一个对象：
 * 
 * 如果mapDispatchToProps是一个函数，
 * 会得到 dispatch 和ownProps（容器组件的props对象）两个参数
 * mapDispatchToProps作为函数，应该返回一个对象，该对象的每个键值对都是一个映射，定义了 UI 组件的参数怎样发出 Action。
 * +++++++++++++++++++++++++++++++++++++++++++++
 *   const mapDispatchToProps = (
 *   dispatch,
 *   ownProps
 * ) => {
 *   return {
 *     onClick: () => {
 *       dispatch({
 *         type: 'SET_VISIBILITY_FILTER',
 *         filter: ownProps.filter
 *       });
 *     }
 *   };
 * }
 *++++++++++++++++++++++++++++++++++++++++++++++
 * 如果mapDispatchToProps是一个对象，
 * 它的每个键名也是对应 UI 组件的同名参数，键值应该是一个函数，会被当作 Action creator ，
 * 返回的 Action 会由 Redux 自动发出。
 * +++++++++++++++++++++++++++++++++++++++++++++
 * const mapDispatchToProps = {
 *   onClick: (filter) => {
 *     type: 'SET_VISIBILITY_FILTER',
 *     filter: filter
 *   };
 * }
 *++++++++++++++++++++++++++++++++++++++++++++++
 * 
 */
const mapDispatchToProps = (
  dispatch,
  ownProps
) => {
  return {
    handleChange: (nextSubreddit) => {
      dispatch(selectSubreddit(nextSubreddit));
    },
    mapFetchPostsIfNeeded: (selectedSubreddit) => {
      dispatch(fetchPostsIfNeeded(selectedSubreddit))
    },
    dispatch // 返回 dispatch，不然组件 props 里面取不到它
  };
}


/**
 * 定义业务逻辑 end
 */

/**
 * React-Redux 提供connect方法，用于从 UI 组件生成容器组件。connect的意思，就是将这两种组件连起来。
 * 
 * App 是 UI 组件，VisibleApp 就是由 React-Redux 通过connect方法自动生成的容器组件。
 * 
 */
const VisibleApp = connect(
  mapStateToProps,
  mapDispatchToProps
)(App);
export default VisibleApp;
