const EXPR_PATTERN = /\{\{([^\}|\{]+)\}\}/g // 正则匹配  例如"{{ a }} {{ b }}" 讲{{}} 都去掉 返回a b
// 用来编译的类
class Compile {
    constructor(el, vm) {
        this.el = this.isElementNode(el) ? el : document.querySelector(el);
        this.vm = vm
        if (this.el) {
            // 如果元素存在，开始编译
            // 1，先把真实的dom移入到内存中 fragment
            let fragment = this.node2fragment(this.el)
            // 2,编译=>提取想要的元素节点 (v-model) 和文本节点 ( {{}} )
            this.compile(fragment)
            // 把编译好的fragment塞回到dom中
            this.el.appendChild(fragment)
        }
    }
    /* 专门写一些辅助的方法 */
    isElementNode(node) {
        return node.nodeType === 1
    }
    isDirective(name) {
         return name.includes('v-')
    }
    /* 核心的方法*/
    node2fragment(el) { // 讲el中的内容全部放到内存中
        // let fragment = document.createDocumentFragment()
        // Array.from(el.childNodes).forEach((item,index) => {
        //     fragment.appendChild(item)
        // })
        let fragment = document.createDocumentFragment()
        let firstChild;
        while (firstChild = el.firstChild) { // 一直取第一个，直到取完
            fragment.appendChild(firstChild)
        }
        return fragment
    }
    compileElement(node) { // 编译元素
        Array.from(node.attributes).forEach(attr => {
            // 判断属性名字是不是包含v-
             let attrName = attr.name
             if(this.isDirective(attrName)) {
                 // 是v-指令，取到对应的值放到节点中
                  let expr = attr.value
                  let [,type] = attrName.split('-') // 指令类型
                  CompileUtil[type](node,this.vm,expr)
             }
        })
    }
    compileText(node) { // 编译文本
        let expr = node.textContent;  // 取文本中的内容
        if(EXPR_PATTERN.test(expr)) {
            // node this.vm.$data  expr
            CompileUtil['text'](node,this.vm,expr)
        }
    }
    compile(fragment) {
        let childNodes = Array.prototype.slice.call(fragment.childNodes)
        childNodes.forEach(node => {
            if(this.isElementNode(node)) {
                // 元素节点
                this.compileElement(node)
                // 是元素节点,还需要继续深入的检查(递归)
                this.compile(node)
            }else {
                 // 文本节点
                this.compileText(node)
            }
        })
    }
}
// 编译的工具类方法。 (为了解耦)
let CompileUtil = {
    getVal(vm,expr) { // 获取实例上对应的数据
        expr = expr.split('.')
        return expr.reduce((prev,next) => {
                return prev[next]
        },vm.$data)
    },
    setVal(vm,expr,newVal) { // 给实例上添加(修改)数据
        expr = expr.split('.')
        return expr.reduce((prev,next,currentIndex) => {
            if(currentIndex === expr.length - 1) {
                return prev[next] = newVal
            }
                return prev[next]
        },vm.$data)
    },
    getTextVal(vm,expr) { // 获取编译文本上的值
        return expr.replace(EXPR_PATTERN,(...arguments) => {
             return this.getVal(vm,arguments[1]) // 获取a b 在vm.$data的值 一起返回出去
        })
    },
    text(node,vm,expr) { // 文本处理
        let updateFn = this.updater['textUpdater'];
        // 文本处理需要把'{{' '}}' 去掉
        let value = this.getTextVal(vm,expr)
        // {{a}} {{b}}
        expr.replace(EXPR_PATTERN,(...arguments) => {
            new Watcher(vm,arguments[1],(newValue) => {
                // 如果数据变化了，文本节点需要重新获取依赖的属性更新文本中的内容(不能直接使用newvalue，因为可能使用到了多个属性)
                // updateFn && updateFn(node,newValue)
                updateFn && updateFn(node,this.getTextVal(vm,expr))
                
            })
        })
        updateFn && updateFn(node,value)
    },
    model(node,vm,expr) { // 输入框处理
        let updateFn = this.updater['modelUpdater'];
        // 这里需要加一个监控 数据变化了 应该调用这个watch的callback
        new Watcher(vm,expr,(newValue) => {
            // 当值变化后会调用cb 把新的值传递过来。
            // updateFn && updateFn(node,this.getVal(vm,expr))
            updateFn && updateFn(node,newValue)
        })
        // 文本框监听input事件
        node.addEventListener('input',(e) => {
            let newVal = e.target.value;
            this.setVal(vm,expr,newVal) // 讲文本框输入的数据辅助给data里的数据(实现v-model双向绑定)
        })
        updateFn && updateFn(node,this.getVal(vm,expr))
    },
    updater : {
         textUpdater(node,value) { //文本更新
            node.textContent = value
         },
         modelUpdater(node,value) { // 输入框更新
            node.value = value
         }
    }
}
