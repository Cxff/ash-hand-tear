<template>
  <div>
    <p>大文件上传组件:</p>
    <input type="file" @change="handleFileChange"/>
    <el-button @click="handleUpload">上传</el-button>
    <el-button @click="handlePause">暂停</el-button>
    <hr>
    <h3>计算文件Hash</h3>
    <el-progress :percentage="hashPercentage"/>
    <h3>总进度</h3>
    <el-progress :percentage="fakeUploadPercentage"/>
    <h3>详细信息</h3>
    <el-table :data="data">
      <el-table-column
          prop="hash"
          label="切片hash"
          align="center"
      ></el-table-column>
      <el-table-column label="大小(B)" align="center" width="120">
        <template v-slot="{ row }">
          {{ row.size | transformByte }}
        </template>
      </el-table-column>
      <el-table-column label="进度" align="center">
        <template v-slot="{ row }">
          <el-progress
              :percentage="row.percentage"
              color="#909399"
          ></el-progress>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import { defineComponent } from 'vue'
import axios from "axios";

const SIZE = 10 * 1024  // 切片大小10M  10485760

export default {
  filters: {
    transformByte(val) {
      return Number(( val / 1024 ).toFixed(0))
    }
  },
  data() {
    return {
      container: {
        file: null,
        hash: '',
        worker: null
      },
      hashPercentage: 0, // hash进度
      data: [],
      requestList: [],
      fakeUploadPercentage: 0
    }
  },
  mounted() {
  },
  ccomputed: {
    uploadPercentage() {
      if ( !this.container.file || !this.data.length ) return 0
      debugger
      const loaded = this.data
          .map(item => item.size * item.percentage)
          .reduce((acc, cur) => acc + cur)
      console.log('loaded==>', loaded);
      return parseInt(( loaded / this.container.file.size ).toFixed(2))
    }
  },
  watch: {
    uploadPercentage(now) {
      if ( now > this.fakeUploadPercentage ) {
        this.fakeUploadPercentage = now;
      }
    }
  },
  methods: {
    request({
              url,
              method = 'post',
              data,
              headers = {},
              requestList,
              onProgress = e => e,
            }) {
      return new Promise(resolve => {
        const xhr = new XMLHttpRequest()
        xhr.upload.onprogress = onProgress
        // xhr.upload.onProgress = e => {
        //   item.percentage = parseInt(String(( e.loaded / e.total ) * 100))
        // }
        xhr.open(method, url)
        Object.keys(headers).forEach(key => {
          xhr.setRequestHeader(key, headers[ key ])
        })
        xhr.send(data)
        xhr.onload = e => {
          // if ( requestList ) {
          //   const xhrIndex = requestList.findIndex(item => item === xhr)
          //   requestList.splice(xhrIndex, 1)
          // }
          resolve({
            data: e.target.response
          })
          requestList?.push(xhr)
          console.log('requestList==>', requestList);
        }
      })
    },
    handleFileChange(e) {
      const [ file ] = e.target.files
      console.log('file==>', file);
      if ( !file ) return
      Object.assign(this.$data, this.$options.data())
      this.container.file = file
      console.log('container==>', this.container);
    },
    // 生成文件切片
    createFileChunk(file, size = SIZE) {
      const fileChunkList = []
      let cur = 0
      while ( cur < file.size ) {
        fileChunkList.push({
          file: file.slice(cur, cur + size)
        })
        cur += size
      }
      return fileChunkList
    },
    // 上传切片
    async uploadChunks(uploadedList = []) {
      const requestList = this.data
          .map(({ chunk, hash, index }) => {
            const formData = new FormData()
            formData.append('chunk', chunk)
            formData.append('hash', hash)
            formData.append('filename', this.container.file.name)
            formData.append('fileHash', this.container.hash)
            return { formData, index }
          })
          .map(async ({ formData, index }) =>
              this.request({
                url: 'http://localhost:3090/',
                data: formData,
                onProgress: this.createProgressHandler(this.data[ index ]),
                requestList: this.requestList
              })
          )
      await Promise.all(requestList)
      if ( uploadedList.length + requestList.length === this.data.length ) {
        await this.mergeRequest();
      }
    },
    // 合并切片
    async mergeRequest() {
      await this.request({
        url: 'http://localhost:3090/merge',
        headers: {
          'content-type': 'application/json'
        },
        data: JSON.stringify({
          size: SIZE,
          filename: this.container.file.name,
          fileHash: this.container.hash
        })
      })
    },
    // 生成文件
    calculateHash(fileChunkList) {
      return new Promise(resolve => {
        this.container.worker = new Worker('/hash.js')
        this.container.worker.postMessage({ fileChunkList })
        this.container.worker.onmessage = e => {
          const { percentage, hash } = e.data;
          this.hashPercentage = percentage;
          if ( hash ) {
            resolve(hash);
          }
        }
      })
    },
    async handleUpload() {
      if ( !this.container.file ) return
      // 生成文件切片
      const fileChunkList = this.createFileChunk(this.container.file)
      this.container.hash = await this.calculateHash(fileChunkList)

      const { shouldUpload } = await this.verifyUpload(
          this.container.file.name,
          this.container.hash
      )
      if ( !shouldUpload ) {
        this.$message.success('秒传, 上传成功')
        return
      }

      this.data = fileChunkList.map(({ file }, index) => ( {
        fileHash: this.container.hash,
        chunk: file,
        index,
        hash: this.container.hash + '-' + index,
        size: file.size,
        percentage: 0
      } ))
      console.log('this.data==>', this.data);
      await this.uploadChunks()
    },

    // 暂停上传
    handlePause() {
      console.log('requestList', this.requestList);
      this.requestList.forEach(xhr => xhr?.abort())
      this.requestList = []
    },

    // 根据hash验证文件是否曾经被上传过
    async verifyUpload(filename, fileHash) {
      const { data } = await this.request({
        url: 'http://localhost:3090/verify',
        headers: {
          'content-type': 'application/json'
        },
        data: JSON.stringify({
          filename,
          fileHash
        })
      });
      return JSON.parse(data)
    },

    createProgressHandler(item) {
      console.log('item==>', item);
      return e => {
        item.percentage = parseInt(String(( e.loaded / e.total ) * 100))
      }
    }
  }
}

// export default defineComponent({
//   name: 'FilesUpload'
// })
</script>

<style scoped>

</style>