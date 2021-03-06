#!/usr/bin/env node

/*
 * The MIT License (MIT)
 *
 * Copyright (c) 2019 Looker Data Sciences, Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

/**
 * Converts a swagger specification file to an OpenAPI specification file and fixes up
 * all missing references
 */
import { ISDKConfigProps, SDKConfig } from './sdkConfig'
import { convertSpec, logConvert } from './convert'
import { quit } from './nodeUtils'
import * as path from 'path'
import { log } from './utils'

const apiVersions = (props: any) => {
  const versions = props.api_versions ?? '3.1,4.0'
  return versions.split(',')
}

const fetchAndConvert = async () => {
  const config = SDKConfig()
  let [name, props] = Object.entries(config)[0]
  // Iterate through all specified API versions
  const apis = apiVersions(props)
  for (const api of apis) {
    let p = JSON.parse(JSON.stringify(props)) as ISDKConfigProps
    p.api_version = api
    void await logConvert(name, p)
  }
}

(async () => {

  if (process.argv.length < 3) log(`yarn ts-node ${process.argv[1]} [Swagger file name] [OpenApi file name]`)
  const args = process.argv.slice(2)
  try {
    if (args.length > 0) {
      const swagger = args[0]
      let oas
      if (args.length > 1) {
        oas = args[1]
      } else {
        const file = path.parse(swagger)
        oas = `${file.dir}${file.dir ? '/' : ''}${file.name}.oas.json`
      }
      log(`Converting ${swagger} to ${oas} ...`)
      convertSpec(swagger, oas)

    } else {
      await fetchAndConvert()
    }
  } catch (e) {
    quit(e)
  }
})()
