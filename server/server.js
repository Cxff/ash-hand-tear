const http = require('http')
const path = require('path')
const fse = require('fs-extra') // 文件操作扩展
const multiparty = require('multiparty') // 解析formData


const hostname = 'localhost'
const port = 3090
const server = http.createServer()

const extractExt = filename =>
  filename.slice(filename.lastIndexOf('.'), filename.length); // 提取后缀名
const UPLOAD_DIR = path.resolve(__dirname, '..', 'target'); // 大文件存储目录

const resolvePost = req => {
  return new Promise(resolve => {
    let chunk = ''
    req.on('data', data => {
      chunk += data
    })
    req.on('end', () => {
      resolve(JSON.parse(chunk))
    })
  })
}


const pipeStream = (path, writeStream) => {
  return new Promise(resolve => {
    const readStream = fse.createReadStream(path)
    // 监听文件读取完毕触发, 没有读取完毕不会触发
    readStream.on('end', () => {
      fse.unlinkSync(path); // 删除文件
      resolve();
    })
    readStream.pipe(writeStream) // 合并
  })
}

// 合并切片
const mergeFileChunk = async (filePath, fileHash, size) => {
  const chunkDir = path.resolve(UPLOAD_DIR, fileHash)
  const chunkPaths = await fse.readdir(chunkDir)
  console.log('chunkDir==>', chunkDir);
  console.log('chunkPaths==>', chunkPaths);
  // 根据切片下标排序, 否则直接读取目录的获得顺序可能会错乱
  chunkPaths.sort((a, b) => a.split('-')[ 1 ] - b.split('-')[ 1 ])
  await Promise.all(
    chunkPaths.map((chunkPath, index) =>
      pipeStream(
        path.resolve(chunkDir, chunkPath),
        fse.createWriteStream(filePath, {
          start: index * size
        })
      )
    )
  )
  fse.rmdirSync(chunkDir); // 合并后删除保存切片的目录
}

server.on('request', async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "*");
  if ( req.method === 'OPTIONS' ) {
    res.status = 200
    res.end()
    return
  }

  if ( req.url === '/merge' ) {
    const data = await resolvePost(req)
    const { fileHash, filename, size } = data
    const ext = extractExt(filename) // 获取后缀名
    const filePath = path.resolve(UPLOAD_DIR, `${ fileHash }${ ext }`) // 文件地址 hash+↑后缀名拼接
    await mergeFileChunk(filePath, fileHash, size)
    res.end(
      JSON.stringify({
        code: 0,
        message: 'file merged success'
      })
    )
  }

  if ( req.url === '/verify' ) {
    const data = await resolvePost(req)
    const { fileHash, filename } = data
    const ext = extractExt(filename) // 获取后缀名
    const filePath = path.resolve(UPLOAD_DIR, `${ fileHash }${ ext }`) // 文件地址 hash+↑后缀名拼接
    // existsSync 如果路径存在返回true, 否则返回false
    if ( fse.existsSync(filePath) ) {
      res.end(
        JSON.stringify({ shouldUpload: false })
      )
    } else {
      res.end(
        JSON.stringify({ shouldUpload: true })
      )
    }
  }

  const multipart = new multiparty.Form()

  multipart.parse(req, async (err, fields, files) => {
    if ( err ) {
      return
    }
    console.log('fields==>', fields);
    const [ chunk ] = files.chunk
    const [ hash ] = fields.hash
    const [ filename ] = fields.filename
    const [ fileHash ] = fields.fileHash
    const filePath = path.resolve(UPLOAD_DIR, `${ fileHash }${ extractExt(filename) }`)

    const chunkDir = path.resolve(UPLOAD_DIR, fileHash)

    // 切片目录不存在, 创建切片目录
    if ( !fse.pathExistsSync(chunkDir) ) {
      await fse.mkdirs(chunkDir)
    }
    await fse.move(chunk.path, path.resolve(chunkDir, hash))
    res.end('received file chunk')
  })

})

server.listen(port, hostname, () => {
  console.log(`Server: http://${ hostname }:${ port }/`);
})