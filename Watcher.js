// 观察者的目的就是给需要变化的那个元素增加一个观察者，当数据变化后执行对应的方法

class Watcher { 
    constructor(vm,expr,cb) {
         this.vm = vm
         this.expr = expr
         this.cb = cb
         this.dep = null // 用于存放该watcher被那个Dep引用了
         // 用新值和老值进行比对，如果发生变化，就调用更新方法。
         this.value = this.get(vm,expr) // 存一下老值
    }
    getVal(vm,expr) { // 获取实例上对应的数据
        expr = expr.split('.')
        return expr.reduce((prev,next) => {
                return prev[next]
        },vm.$data)
    }
    get(vm,expr) {
        Dep.target = this; // 每次取值的时候，会调用observer的get,将this实例挂载到Dep.target上，然后在Observer的get里进行addSub
        let value = this.getVal(vm,expr)
        Dep.target = null; // 用完清空
        return value
    }
    addDep(dep) {
         this.dep = dep
    }
    // 暴露给外界的方法，
    update() {
         let newValue = this.get(this.vm,this.expr)
         let oldValue = this.value
         if(newValue !== oldValue) {
              this.cb(newValue)
         }
    }
}
