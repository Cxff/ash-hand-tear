
const person = reactive({ name: 'ash', age: 18 })
const animal = reactive({ type: 'cat', name: '皮蛋' })
let nameStr1 = ''
let ageStr1 = ''

const effectNameStr1 = () => { nameStr1 = `我的名字叫${person.name}` }
const effectAgeStr1 = () => { ageStr1 = `我的年龄是${person.age}` }

const targetMap = new WeakMap()
/**
 * 
 * @param {*} key 
 * dep是使用Set, person有两个属性,故有两个dep, 用Map来进行存储
 */

function track(target, key) {
  if (!activeEffect) return
  let depsMap = targetMap.get(target)
  console.log('depsMap1', depsMap)
  if (!depsMap) {
    targetMap.set(target, depsMap = new Map)
  }
  console.log('targetMap', targetMap)
  console.log('depsMap2', depsMap)
  let dep = depsMap.get(key)
  if (!dep) {
    depsMap.set(key, dep = new Set())
  }
  dep.add(activeEffect)
}

function trigger(target, key) {
  let depsMap = targetMap.get(target)
  if (depsMap) {
    const dep = depsMap.get(key)
    if (dep) {
      dep.forEach(effect => effect());
    }
  }
}

/**
 * 
 * get(target, key, receiver)
 * 访问target的key属性,  this执行receiver
 * 
 * return Reflect.get(receiver, key) // 相当于receiver[key]   会无限循环导致栈溢出
 * 
 * TODO 为何不使用Reflect.get(target, key)  而是使用Reflect.get(target,key,receiver)
 * 尽量把this放在receiver上,而不放在target上???
 * 因为原对象target有可能本来也是另一个代理的代理对象, SO如果this一直放target上的话, 处bug的概率大大提高
 */
function reactive(target) {
  const handler = {
    get(target, key, receiver) {
      console.log('get==>', target, key, receiver)
      track(receiver, key)
      return Reflect.get(target, key, receiver)
    },
    set(target, key, value, receiver) {
      Reflect.set(target, key, value, receiver)
      trigger(receiver, key)
    }
  }
  return new Proxy(target, handler)
}

let activeEffect = null
function effect(fn) {
  activeEffect = fn
  activeEffect()
  activeEffect = null
}

function ref(initValue) {
  return reactive({
    value: initValue
  })
}

function computed(fn) {
  const result = ref()
  effect(() => result.value = fn())
  return result
}

effect(effectNameStr1)
console.log(nameStr1, ageStr1)
person.name = '小灰'
person.age = 22
console.log(nameStr1, ageStr1)