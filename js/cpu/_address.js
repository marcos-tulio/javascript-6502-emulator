
//---------------------------------
//   Address Modes
//---------------------------------
class Address{
    /**
     * 
     * @param {Cpu} cpu 
     */
    constructor(cpu){
        this.cpu = cpu
    }

    abs(){
        printLog("Address mode ABS executed!")

        var low = forceUInt16( this.cpu.read(this.cpu.pcount) )
        this.cpu.pcount++

        var high = forceUInt16( this.cpu.read(this.cpu.pcount) )
        this.cpu.pcount++

        this.cpu.addr_abs = (high << 8) | low

        return 0
    }

    abx(){
        printLog("Address mode ABX executed!")

        var low = forceUInt16( this.cpu.read(this.cpu.pcount) )
        this.cpu.pcount++

        var high = forceUInt16( this.cpu.read(this.cpu.pcount) )
        this.cpu.pcount++

        this.cpu.addr_abs = (high << 8) | low
        this.cpu.addr_abs += this.cpu.reg_x

        if ( (this.cpu.addr_abs & 0xFF00) != (high << 8))
            return 1
        else
            return 0
    }

    aby(){
        printLog("Address mode ABY executed!")

        var low = forceUInt16( this.cpu.read(this.cpu.pcount) )
        this.cpu.pcount++

        var high = forceUInt16( this.cpu.read(this.cpu.pcount) )
        this.cpu.pcount++

        this.cpu.addr_abs = (high << 8) | low
        this.cpu.addr_abs += this.cpu.reg_y

        if ( (this.cpu.addr_abs & 0xFF00) != (high << 8))
            return 1
        else
            return 0
    }

    ind(){
        printLog("Address mode IND executed!")

        var ptr_low = forceUInt16( this.cpu.read(this.cpu.pcount) )
        this.cpu.pcount++

        var ptr_high = forceUInt16( this.cpu.read(this.cpu.pcount) )
        this.cpu.pcount++

        var ptr = (ptr_high << 8) | ptr_low

        // Corrige um bug de hardware 
        if (ptr_low == 0x00FF)
            this.cpu.addr_abs = (this.cpu.read(ptr & 0xFF00) << 8) | this.cpu.read(ptr + 0)

        // Comportamento normal
        else 
            this.cpu.addr_abs = (this.cpu.read(ptr + 1) << 8) | this.cpu.read(ptr + 0)

        return 0
    }

    imm(){
        printLog("Address mode IMM executed!")

        this.cpu.addr_abs = this.cpu.pcount++

        return 0
    }

    imp(){
        printLog("Address mode IMP executed!")

        this.cpu.fetched = this.cpu.acc

        return 0
    }

    izx(){
        printLog("Address mode IZX executed!")
 
        var t = forceUInt16( this.cpu.read(this.cpu.pcount) )
        this.cpu.pcount++

        var low  = forceUInt16( this.cpu.read( forceUInt16( t + forceUInt16(this.cpu.reg_x) ) & 0x00FF)     )
        var high = forceUInt16( this.cpu.read( forceUInt16( t + forceUInt16(this.cpu.reg_x) + 1 ) & 0x00FF) )

        this.cpu.addr_abs = (high << 8) | low

        return 0
    }

    izy(){
        printLog("Address mode IZY executed!")

        var t = forceUInt16( this.cpu.read(this.cpu.pcount) )
        this.cpu.pcount++

        var low  = forceUInt16( this.cpu.read(t & 0x00FF) )
        var high = forceUInt16( this.cpu.read((t + 1) & 0x00FF) )

        this.cpu.addr_abs = (high << 8) | low
        this.cpu.addr_abs += y

        if ( (this.cpu.addr_abs & 0xFF00) != (high << 8) )
            return 1

        return 0
    }

    rel(){
        printLog("Address mode REL executed!")

        this.cpu.addr_rel = this.cpu.read(this.cpu.pcount)
        this.cpu.pcount++

        if (this.cpu.addr_rel & 0x80)
            this.cpu.addr_rel |= 0xFF00

        return 0
    }

    zp0(){
        printLog("Address mode ZP0 executed!")

        this.cpu.addr_abs = this.cpu.read(cpu.pcount)
        
        this.cpu.pcount++

        this.cpu.addr_abs &= 0x00FF

        return 0
    }

    zpx(){
        printLog("Address mode ZPX executed!")

        this.cpu.addr_abs = this.cpu.read(cpu.pcount) + this.cpu.reg_x
        
        this.cpu.pcount++

        this.cpu.addr_abs &= 0x00FF

        return 0
    }

    zpy(){
        printLog("Address mode ZPY executed!")

        this.cpu.addr_abs = this.cpu.read(cpu.pcount) + this.cpu.reg_y
        
        this.cpu.pcount++

        this.cpu.addr_abs &= 0x00FF

        return 0
    }

}