<template>
  <quasar-layout>
    <div slot="header" class="toolbar">
      <quasar-toolbar-title :padding="1">
        Quasar Framework v{{quasarVersion}}
      </quasar-toolbar-title>
    </div>

    <!--
      Replace following "div" with
      "<router-view class="layout-view">" component
      if using subRoutes
    -->
    <div class="layout-view">
      <div class="layout-padding">
        <quasar-stepper @finish="finish()" ref="stepper">
          <quasar-step title="What type of data is this?" :ready="isStep2Ready" class="on-left">
            <myselect
              type="radio"
              v-model="spatialDataType"
              :options="spatailDataTypes"
              placeholder="Choose data type"
            ></myselect>
            <br>

            <map :zoom="zoom" :center="center">
              <tilelayer :url="url"></tilelayer>
              <marker :position="center"></marker>
            </map>
          </quasar-step>
          
          <quasar-step title="Tell us about your data" :ready="isStep3Ready" class="on-left">
            <div class="floating-label">
              <input required class="full-width" v-model="datasetName" id="datasetName" autofocus>
              <label>What is your dataset called?</label>
            </div>
            <br>

            <p class="caption">Upload your dataset</p>
            <input type="file" id="file" @change="onFileChange">
            <br>

            <quasar-progress v-if="isUploading" :percentage="uploadPercentCompleted"></quasar-progress>
          </quasar-step>

          <quasar-step title="Define QA rules" :ready="isStep4Ready" class="on-left">
            <myselect
              type="radio"
              v-model="qaRuleType"
              :options="qaRuleTypes"
              placeholder="Choose a QA rule type"
            ></myselect>
            <br>
            
            <myselect
              type="radio"
              v-model="qaRule1Column"
              :options="datasetColumnNames"
              placeholder="Choose column"
            ></myselect>
            
            <myselect
              type="radio"
              v-model="qaRule1Region"
              :options="regionNames"
              placeholder="Choose a region type"
            ></myselect>
            <br>

            <p class="caption">Enter all of the possible values this column may have</p>
            <quasar-chips v-model="qaRule1Values"></quasar-chips>
          </quasar-step>
        </quasar-stepper>
      </div>
    </div>
  </quasar-layout>
</template>

<script>
// import Quasar, { Utils } from 'quasar'
// import Vue from 'vue'
import Quasar, { Toast } from 'quasar'
import axios from 'axios'
// import myselect from 'myselect'
import myselect from './myselect.vue'

import map from 'vue-leaflet'
// import tilelayer from 'vue-leaflet'
// import marker from 'vue-leaflet'

export default {
  components: {
    'myselect': myselect,
    map
    // tilelayer,
    // marker
  },
  beforeMount () {
    axios.get('http://139.59.248.255/0.1/get_capabilities').then((response) => {
      console.log(response.data)
      this.capabilities = JSON.parse(JSON.stringify(response.data))
    })
  },
  data () {
    return {
      title: 'Vue Leaflet Demo',
      zoom: 13,
      center: [51.505, -0.09],
      url: 'http://{s}.tile.osm.org/{z}/{x}/{y}.png',

      capabilities: null,

      quasarVersion: Quasar.version,

      // Step 2
      spatialDataType: null,
      spatailDataTypes: [],

      // Step 3
      datasetName: null,
      isUploading: false,
      uploadPercentCompleted: 0,
      datasetColumnNames: [],
      regionNames: [],

      // Step 4
      isStep4Ready: false,
      qaRuleType: null,
      qaRuleTypes: [{label: 'Label', value: 'Value'}],
      qaRule1Column: null,
      qaRule1Region: null,
      qaRule1Values: [],
      qaRule1DatasetColumnNames: []
    }
  },
  computed: {
    isStep2Ready: function () {
      return this.spatialDataType != null
    },
    isStep3Ready: function () {
      return this.datasetName !== null && this.isUploading === false && this.datasetColumnNames.length > 0
    },
    capabilities: {
      set: function (newValue) {
        var spatailDataTypes = []
        newValue.spatialType.forEach(function (value) {
          spatailDataTypes.push({
            label: value,
            value: value
          })
        })
        this.spatailDataTypes = spatailDataTypes

        var qaRuleTypes = []
        newValue.qaRules.forEach(function (value) {
          qaRuleTypes.push({
            label: value.name,
            value: value.name
          })
        })
        this.qaRuleTypes = qaRuleTypes

        var regionNames = []
        Object.keys(newValue.regions).forEach(function (key) {
          let obj = newValue.regions[key]
          regionNames.push({
            label: obj.description,
            value: key
          })
        })
        this.regionNames = regionNames
      }
    }
  },
  methods: {
    onFileChange (e) {
      var files = e.target.files || e.dataTransfer.files
      if (!files.length) {
        return
      }

      var reader = new FileReader()
      reader.onload = (e) => {
        var data = new FormData()
        data.append('csvFile', new Blob([e.target.result], { type: 'text/csv' }))

        var vue = this
        var config = {
          onUploadProgress: function (progressEvent) {
            vue.uploadPercentCompleted = (progressEvent.loaded / progressEvent.total) * 100
          }
        }

        this.isUploading = true
        axios.post('http://139.59.248.255/0.1/get_csv_column_names', data, config)
          .then((response) => {
            this.isUploading = false
            Toast.create({
              html: 'Dataset uploaded successfully',
              icon: 'file_upload'
            })

            var datasetColumnNames = []
            response.data.forEach(function (value) {
              datasetColumnNames.push({
                label: value,
                value: value
              })
            })
            this.datasetColumnNames = datasetColumnNames
          })
      }
      reader.readAsText(files[0])
    }
  }
}
</script>

<style lang="styl">
/*.logo-container
  width 192px
  height 268px
  perspective 800px
  position absolute
  top 50%
  left 50%
  transform translateX(-50%) translateY(-50%)
.logo
  position absolute
  transform-style preserve-3d*/
</style>
