let obj = {
	0:1,
	1:2,
	2:3,
	length: 3
}

// length 决定Array.from最终返回的新数组的长度, 裁剪或补齐(undefined)
let newArr = Array.from(obj, function (item, index)  {
	return {
		studentId: `${this.prefix}${item}`,
		order: index
	}
}, {
	prefix: 'No.'
})
console.log('newArr==>',newArr)
