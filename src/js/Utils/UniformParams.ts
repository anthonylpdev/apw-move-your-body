import { IUniform, Color } from 'three'

function getUKey(k: string) {
  return 'u' + k.charAt(0).toUpperCase() + k.slice(1)
}

function getProp(propKey: string, value: any, colorKeys: Array<string>) {
  return colorKeys.indexOf(propKey) !== -1 ? new Color(value) : value
}

interface FuncParams {
  colorKeys: Array<string>
  exceptionKeys: Array<string>
  onChangeCallbacks: Array<Function>
}

const defaultFuncParams = {
  colorKeys: ['color'],
  exceptionKeys: ['_gsap'],
  onChangeCallbacks: [],
}

export function SetupParams<T>(
  inParams: T,
  p: Partial<FuncParams> = {}
): {
  params: T
  uniforms: { [name: string]: IUniform }
} {
  const { colorKeys, exceptionKeys, onChangeCallbacks } = {
    ...defaultFuncParams,
    ...p,
  }

  const uniforms = {}

  const handler = {
    set: function (obj, propKey, value) {
      onChangeCallbacks.forEach((c) => c())
      if (exceptionKeys.indexOf(propKey) == -1)
        uniforms[getUKey(propKey)].value = getProp(propKey, value, colorKeys)
      obj[propKey] = value
      return true
    },
  }

  const params = new Proxy(inParams, handler)

  Object.keys(params).forEach((k) => {
    uniforms[getUKey(k)] = { value: getProp(k, params[k], colorKeys) }
  })

  return { params, uniforms }
}
