// 数据劫持
class Observer {
    constructor(data) {
        this.observer(data)
    }
    observer(data) {
        // 要对这个data数据将原有的属性改成get和set
        if (!data || typeof data !== 'object') {
            return
        }
        // 要将数据一一劫持，先获取到data的key和value
        Object.keys(data).forEach(key => {
            // 劫持
            this.defineReactive(data, key, data[key])
            // 如果value值是对象 继续劫持
            this.observer(data[key]) // 深度递归劫持
        })
    }
    defineReactive(obj, key, value) {
         let that = this
         let dep = new Dep(); // 每个变化的数据 都会对应一个数组，这个数组是存放所有更新的操作。
         Object.defineProperty(obj,key,{
             enumerable : true, // 可枚举
             configurable : true, // 可删除
             get() {
                 if(Dep.target) {
                      dep.addSub(Dep.target)
                      Dep.target.addDep(dep) // 添加 watcher 对 dep 的引用
                 }
                 return value
             },
             set(newValue) {
                if(newValue !== value) {
                     that.observer(newValue) // 如果是对象，继续劫持
                     value = newValue
                     dep.notify(); // 通知所有人，数据更新了
                }
             }
         })
    }
}
