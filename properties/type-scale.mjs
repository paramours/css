import { generateTypeScaleProperties, defaultConfig } from '../lib/scales.mjs'

export default function typeScaleProperties(state = {}) {
  const { config = {} } = state
  const { typeScale = defaultConfig } = config
  const checkAccessibility = typeScale.checkAccessibility ?? true

  if ( checkAccessibility && !validateTypeScaleAccessibility(typeScale) ) {
    throw new Error('Your requested type scale fails the WCAG SC 1.4.4 accessibility rule. '
      + "If you would like to proceed anyway, then set 'checkAccessibility' "
      + 'to false in your typeScale config.'
    )
  }

  let output = ''

  if (typeScale) {
    output = '/*** Type Scale ***/\n:root {'
    output += generateTypeScaleProperties(typeScale)
    output += '\n}'
  }

  return output
}

function validateTypeScaleAccessibility(typeScale) {
  // WCAG SC 1.4.4 check, ported from https://github.com/barvian/fluid-tailwind/blob/f85f1ae5a50ec1a37f99418d6d087a3a2e783e1b/packages/fluid-tailwind/src/util/expr.ts#L116
  // @see https://www.smashingmagazine.com/2023/11/addressing-accessibility-concerns-fluid-type/
  const { baseMin, baseMax, viewportMin, viewportMax } = typeScale
  const slope = (baseMax - baseMin) / (viewportMax - viewportMin)
  const intercept = baseMin - viewportMin * slope

  // 2*zoom1(vw) is the AA requirement
  const zoom1 = (vw) => clamp(baseMin, intercept + slope * vw, baseMax)
  const zoom5 = (vw) =>
    // browser doesn't scale vw units when zooming, so this isn't 5*zoom1(vw)
    clamp(5 * baseMin, 5 * intercept + slope * vw, 5 * baseMax)

  // Check the clamped points on the lines 2*z1(vw) and zoom5(vw) and fail if zoom5 < 2*zoom1
  if (5 * baseMin < 2 * zoom1(5 * viewportMin)) {
    return false
  }
  if (zoom5(viewportMax) < 2 * baseMax) {
    return false
  }
  return true  
}

/**
 * Simulate the math that CSS `clamp` does
 * @param {number} min 
 * @param {number} n 
 * @param {number} max 
 */
function clamp(min, n, max) {
  return Math.min(Math.max(n, min), max)
}
