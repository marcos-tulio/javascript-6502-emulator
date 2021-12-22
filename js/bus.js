//-------------------------------------------------------------
//                            BUS
//-------------------------------------------------------------
class Bus{
    constructor(cpu, ram_size = (1024 * 64)){
        printLog("BUS as created!")

        // Init ram
        this.ram = new Uint8Array(ram_size)
        this.ram.map((_byte) => { _byte = 0x00 })
        printLog("BUS.ram initialized!")

        // Connect at CPU
        this.cpu = cpu
        this.cpu.connectBus(this)
    }

    write(addr, data){  
        addr = forceUInt16(addr)
        data = forceUInt8(data)

        if (addr >= 0x0000 && addr <= 0xFFFF){
            this.ram[addr] = data
            printLog("BUS write " + data + " in ram at address " + addr)
        }
    }

    read(addr, isReadOnly = false){
        addr = forceUInt16(addr)

        if (addr >= 0x0000 && addr <= 0xFFFF){
            printLog("BUS read 0x" + toHex(this.ram[addr], 2) + " in ram address 0x" + toHex(addr, 4))  
            return this.ram[addr]
        }

        printLog("BUS read 0")
        return 0x00
    }
}