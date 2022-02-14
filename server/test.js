function test({
                name = '',
                onProgress = e => e
              }) {
}

const data = [ { title: 'item1' }, { title: 'item2' } ]

test({
  name: '张三',
  onProgress: renderNumber(data[ 0 ])
})

function renderNumber(item) {
  return e => {
    item.percentage = parseInt(String(( e.loaded / e.total ) * 100))
  }
}