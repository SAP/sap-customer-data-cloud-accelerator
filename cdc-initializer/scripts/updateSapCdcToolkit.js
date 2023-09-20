import SapCdcToolkit from './sapCdcToolkit'

const toolkit = new SapCdcToolkit()
try {
    await toolkit.update()
} catch (error) {
    console.log(error.message)
}
