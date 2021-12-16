
let targetMap = new WeakMap()
let effectStack = []

// 收集完成
function track(target, key) {
  const effect = effectStack[effectStack.length - 1]
  if (effect) {
    let depMap = targetMap.get(target)
    if (depMap === undefined) {
      depMap = new Map()
      targetMap.set(target, depMap)
    }

    let dep = depMap.get(key)
    if (dep === undefined) {
      dep = new Set()
      depMap.set(key, dep)
    }
    // ↑ 初始化完成
    // ↓ 开始进行收集
    if (!dep.has(effect)) {
      dep.add(effect)
      effect.deps.push(dep)
    }
  }
}

function trigger(target, key, info) {
  let depMap = targetMap.get(target)
  if (depMap === undefined) {
    return
  }

  const effects = new Set()
  const computeds = new Set()

  if (key) {
    let deps = depMap.get(key)
    deps.forEach(effect => {
      if (effect.computed) {
        computeds.add(effect)
      } else {
        effects.add(effect)
      }
    })
  }

  effects.forEach(effect => effect())
  computeds.forEach(computed => computed())

}

const baseHandler = {
  get(target, key) {
    const ret = target[key]
    // 收集依赖 ☞ 全局的map
    track(target, key)
    return ret
  },
  set(target, key, val) {
    const info = { oldValue: target[key], newValue: val }
    target[key] = val
    // 拿到收集的effect, 去执行
    trigger(target, key, info)
  }
}

function reactive(target) {
  const observed = new Proxy(target, baseHandler)
  return observed
}

function computed(fn) {
  const runner = effect(fn, { computed: true, lazy: true })
  return {
    effect: runner,
    get value() {
      return runner()
    }
  }
}

function effect(fn, options = {}) {
  let e = createReactiveEffect(fn, options)
  if (!options.lazy) {
    e()
  }
  return e
}

function createReactiveEffect(fn, options) {
  const effect = function effect(...args) {
    return run(effect, fn, args)
  }
  effect.deps = []
  effect.computed = options.computed
  effect.lazy = options.lazy
  return effect
}

function run(effect, fn, args) {
  if (effectStack.indexOf(effect) === -1) {
    try {
      effectStack.push(effect)
      return fn(...args)
    } finally {
      effectStack.pop()
    }
  }
}