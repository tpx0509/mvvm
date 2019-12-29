class Vue {
     constructor(options) {
         // 一上来先把可用的东西挂载在实例上
          this.$el = options.el
          this.$data = options.data
          // 如果有要编译的模板就开始编译
          if(this.$el) {
               // 数据劫持， 给对象的所有属性 添加get，set
               new Observer(this.$data)
               // 代理
               this.proxyData(this.$data)
               // 用数据和元素进行编辑
               new Compile(this.$el,this)
          }
     }
     proxyData(data) {
          /*
            将实例上的,this.$data里的数据直接代理到this上
          */
          Object.keys(data).forEach(key => {
               Object.defineProperty(this,key,{
                    get() {
                        return data[key]
                    },
                    set(newValue) {
                        data[key] = newValue
                    }
               })
          })
     }
}