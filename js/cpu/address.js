
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

    // Address Mode: Absolute 
    abs(){
        printLogInstruction("Address mode ABS executed!")

        let low = forceUInt16( this.cpu.read(this.cpu.pcount) )
        this.cpu.pcount = forceUInt16(this.cpu.pcount + 1)

        let high = forceUInt16( this.cpu.read(this.cpu.pcount) )
        this.cpu.pcount = forceUInt16(this.cpu.pcount + 1)

        this.cpu.addr_abs = (high << 8) | low

        return 0
    }

    // Address Mode: Absolute with X Offset
    abx(){
        printLogInstruction("Address mode ABX executed!")

        let low = forceUInt16( this.cpu.read(this.cpu.pcount) )
        this.cpu.pcount = forceUInt16(this.cpu.pcount + 1)

        let high = forceUInt16( this.cpu.read(this.cpu.pcount) )
        this.cpu.pcount = forceUInt16(this.cpu.pcount + 1)

        this.cpu.addr_abs = (high << 8) | low
        this.cpu.addr_abs += this.cpu.reg_x

        if ( (this.cpu.addr_abs & 0xFF00) != (high << 8))
            return 1
        
        return 0
    }

    // Address Mode: Absolute with Y Offset
    aby(){
        printLogInstruction("Address mode ABY executed!")

        let low = forceUInt16( this.cpu.read(this.cpu.pcount) )
        this.cpu.pcount = forceUInt16(this.cpu.pcount + 1)

        let high = forceUInt16( this.cpu.read(this.cpu.pcount) )
        this.cpu.pcount = forceUInt16(this.cpu.pcount + 1)

        this.cpu.addr_abs = (high << 8) | low
        this.cpu.addr_abs += this.cpu.reg_y

        if ( (this.cpu.addr_abs & 0xFF00) != (high << 8))
            return 1
        
        return 0
    }

    // Address Mode: Indirect
    ind(){
        printLogInstruction("Address mode IND executed!")

        let ptr_low = forceUInt16( this.cpu.read(this.cpu.pcount) )
        this.cpu.pcount = forceUInt16(this.cpu.pcount + 1) 

        let ptr_high = forceUInt16( this.cpu.read(this.cpu.pcount) )
        this.cpu.pcount = forceUInt16(this.cpu.pcount + 1)

        let ptr = (ptr_high << 8) | ptr_low

        // Corrige um bug de hardware 
        if (ptr_low == 0x00FF)
            this.cpu.addr_abs = (this.cpu.read(ptr & 0xFF00) << 8) | this.cpu.read(ptr + 0)

        // Comportamento normal
        else 
            this.cpu.addr_abs = (this.cpu.read(ptr + 1) << 8) | this.cpu.read(ptr + 0)

        return 0
    }

    // Address Mode: Immediate
    imm(){
        printLogInstruction("Address mode IMM executed!")

        this.cpu.addr_abs = this.cpu.pcount
        this.cpu.pcount = forceUInt16(this.cpu.pcount + 1) 

        return 0
    }

    // Address Mode: Implied
    imp(){
        printLogInstruction("Address mode IMP executed!")

        
        this.cpu.fetched = this.cpu.acc

        return 0
    }

    // Address Mode: Indirect X
    izx(){
        printLogInstruction("Address mode IZX executed!")
 
        let t = forceUInt16( this.cpu.read(this.cpu.pcount) )
        this.cpu.pcount = forceUInt16(this.cpu.pcount + 1)

        let low  = forceUInt16( this.cpu.read( forceUInt16( t + forceUInt16(this.cpu.reg_x) ) & 0x00FF)     )
        let high = forceUInt16( this.cpu.read( forceUInt16( t + forceUInt16(this.cpu.reg_x) + 1 ) & 0x00FF) )

        this.cpu.addr_abs = (high << 8) | low

        return 0
    }

    // Address Mode: Indirect Y
    izy(){
        printLogInstruction("Address mode IZY executed!")

        let t = forceUInt16( this.cpu.read(this.cpu.pcount) )
        this.cpu.pcount = forceUInt16(this.cpu.pcount + 1)

        let low  = forceUInt16( this.cpu.read(t & 0x00FF) )
        let high = forceUInt16( this.cpu.read((t + 1) & 0x00FF) )

        this.cpu.addr_abs = (high << 8) | low
        this.cpu.addr_abs += this.cpu.reg_y

        if ( (this.cpu.addr_abs & 0xFF00) != (high << 8) )
            return 1

        return 0
    }

    // Address Mode: Relative
    rel(){
        printLogInstruction("Address mode REL executed!")

        this.cpu.addr_rel = this.cpu.read(this.cpu.pcount)
        this.cpu.pcount = forceUInt16(this.cpu.pcount + 1)

        if (this.cpu.addr_rel & 0x80)
            this.cpu.addr_rel |= 0xFF00

        return 0
    }

    // Address Mode: Zero Page
    zp0(){
        printLogInstruction("Address mode ZP0 executed!")

        this.cpu.addr_abs = this.cpu.read(cpu.pcount)
        
        this.cpu.pcount = forceUInt16(this.cpu.pcount + 1)

        this.cpu.addr_abs &= 0x00FF

        return 0
    }

    // Address Mode: Zero Page with X Offset
    zpx(){
        printLogInstruction("Address mode ZPX executed!")

        this.cpu.addr_abs = this.cpu.read(cpu.pcount) + this.cpu.reg_x
        
        this.cpu.pcount = forceUInt16(this.cpu.pcount + 1)

        this.cpu.addr_abs &= 0x00FF

        return 0
    }

    // Address Mode: Zero Page with Y Offset
    zpy(){
        printLogInstruction("Address mode ZPY executed!")

        this.cpu.addr_abs = this.cpu.read(cpu.pcount) + this.cpu.reg_y
        
        this.cpu.pcount = forceUInt16(this.cpu.pcount + 1)

        this.cpu.addr_abs &= 0x00FF

        return 0
    }

}