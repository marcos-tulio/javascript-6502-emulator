//-------------------------------------------------------------
//                         Helpers
//-------------------------------------------------------------
show_log_all = false
show_log_instruction = true

function printLog(message){
    if (show_log_all)
        console.log(message)
}

function printLogInstruction(message){
    if (show_log_instruction)
        console.log(message)
}

function forceUInt8(value){
    return value & 0xFF
}

function forceUInt16(value){
    return value & 0xFFFF
}

function toHex(value, digits = 2){
    let str = value.toString(16).toUpperCase()

    while (str.length < digits)
        str = "0" + str

    return str
}