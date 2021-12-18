import { createStore } from 'vuex'

// 手撕vuex
// import { createStore } from './ashVuex'

const store = createStore({
  state() {
    return {
      count: 1
    }
  },
  getters: {
    double(state) {
      return state.count * 2
    }
  },
  mutations: {
    addCount(state) {
      state.count++
    }
  },
  actions: {
    asyncAdd({ commit }) {
      setTimeout(() => {
        commit('addCount')
      }, 1000)
    }
  }
})

export default store