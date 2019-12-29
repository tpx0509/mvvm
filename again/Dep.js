// 发布订阅
class Dep {
    constructor() {
        // 订阅的数组
         this.subs = [] 
    }
    addSub(watcher) {
        //  console.log(watcher)
         this.subs.push(watcher)
         this.subs = Array.from(new Set(this.subs))
    }
    notify() {
        console.log('this.subs',this.subs)
        this.subs.forEach(watcher => watcher.update())
    }
}
Dep.target = null;