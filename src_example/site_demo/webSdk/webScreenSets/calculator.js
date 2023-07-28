/*
 * Copyright: Copyright 2023 SAP SE or an SAP affiliate company and cdc-initializer contributors
 * License: Apache-2.0
 */
export default {
    add: function (a, b) {
        return a + b
    },
    subtract: (a, b) => a - b,
    exampleWithModernJavaScript: (a) => {
        const b = a
        const tempArray = [{ a: 1 }, { a: 2 }, { a: 3 }]
        const tempArray2 = tempArray.map(({ a }) => a)
        return { b, tempArray2 }
    },
    // Usage example in WebScreenSets:
    // const { calculator } = gigya.thisScript.globalConf.webScreenSets
    // console.log(calculator.add(1, 2)) // 3
}
