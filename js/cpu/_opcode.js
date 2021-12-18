
//---------------------------------
//   Instructions Modes
//---------------------------------
class OpCode{

    /**
     * 
     * @param {Cpu} cpu 
     */
    constructor(cpu){
        this.cpu = cpu
    }

    // Instruction: Add with Carry In
    // Function:    A = A + M + C
    // Flags Out:   C, V, N, Z
    adc(){
        printLogInstruction("Opcode mode ADC executed!")

        // Grab the data that we are adding to the accumulator
        this.cpu.fetch()
        
        // Add is performed in 16-bit domain for emulation to capture any
        // carry bit, which will exist in bit 8 of the 16-bit word
        let temp = forceUInt16( 
            forceUInt16(this.cpu.acc) + 
            forceUInt16(this.cpu.fetched) + 
            forceUInt16(this.cpu.getFlag(this.cpu.FLAG.C)) 
        ) 
   
        // The carry flag out exists in the high byte bit 0
        this.cpu.setFlag(this.cpu.FLAG.C, temp > 255)
        
        // The Zero flag is set if the result is 0
        this.cpu.setFlag(this.cpu.FLAG.Z, (temp & 0x00FF) == 0)
        
        // The signed Overflow flag is set based on all that up there! :D
        let a_xor_fetched = forceUInt16(this.cpu.acc) ^ forceUInt16(this.cpu.fetched)
        let a_xor_temp    = forceUInt16(this.cpu.acc) ^ forceUInt16(temp)
        this.cpu.setFlag( this.cpu.FLAG.V, (~a_xor_fetched & a_xor_temp) & 0x0080 )

        // The negative flag is set to the most significant bit of the result
        this.cpu.setFlag(this.cpu.FLAG.N, temp & 0x80)
        
        // Load the result into the accumulator (it's 8-bit dont forget!)
        this.cpu.acc = temp & 0x00FF
        
        // This instruction has the potential to require an additional clock cycle
        return 1
    }

    // Instruction: Bitwise Logic AND
    // Function:    A = A & M
    // Flags Out:   N, Z
    and(){
        printLogInstruction("Opcode mode AND executed!")

        this.cpu.fetch()

        this.cpu.acc = this.cpu.acc & this.cpu.fetched

        this.cpu.setFlag(this.cpu.FLAG.Z, this.cpu.acc == 0x00)
        this.cpu.setFlag(this.cpu.FLAG.N, this.cpu.acc & 0x80)

        return 1
    }

    asl(){
        printLogInstruction("Opcode mode ASL executed!")
    }

    // Generic function to branch instructions
    branch(condition){
        if (condition){
            this.cpu.cycles++
            this.cpu.addr_abs = forceUInt16( this.cpu.pcount + this.cpu.addr_rel )

            if ( (this.cpu.addr_abs & 0xFF00) != (this.cpu.pcount & 0xFF00) )
                this.cpu.cycles++

            this.cpu.pcount = this.cpu.addr_abs
        }

        return 0
    }

    // Instruction: Branch if Carry Clear
    // Function:    if(C == 0) pc = address 
    bcc(){
        printLogInstruction("Opcode mode BCC executed!")
        return this.branch( this.cpu.getFlag(this.cpu.FLAG.C) == 0 )
    }

    // Instruction: Branch if Carry Set
    // Function:    if(C == 1) pc = address
    bcs(){
        printLogInstruction("Opcode mode BCS executed!")
        return this.branch( this.cpu.getFlag(this.cpu.FLAG.C) == 1 )
    }

    // Instruction: Branch if Equal
    // Function:    if(Z == 1) pc = address
    beq(){
        printLogInstruction("Opcode mode BEQ executed!")
        return this.branch( this.cpu.getFlag(this.cpu.FLAG.Z) == 1 )
    }

    bit(){
        printLogInstruction("Opcode mode BIT executed!")
    }

    // Instruction: Branch if Negative
    // Function:    if(N == 1) pc = address
    bmi(){
        printLogInstruction("Opcode mode BMI executed!")
        return this.branch( this.cpu.getFlag(this.cpu.FLAG.N) == 1 )
    }

    // Instruction: Branch if Not Equal
    // Function:    if(Z == 0) pc = address
    bne(){
        printLogInstruction("Opcode mode BNE executed!")
        return this.branch( this.cpu.getFlag(this.cpu.FLAG.Z) == 0 )
    }

    // Instruction: Branch if Positive
    // Function:    if(N == 0) pc = address
    bpl(){
        printLogInstruction("Opcode mode BPL executed!")
        return this.branch( this.cpu.getFlag(this.cpu.FLAG.N) == 0 )
    }

    // Instruction: Break
    // Function:    Program Sourced Interrupt
    brk(){
        printLogInstruction("Opcode mode BRK executed!")

        this.cpu.pcount = forceUInt16(this.cpu.pcount + 1)

        this.cpu.setFlag(this.cpu.FLAG.I, true)

        this.cpu.write(0x0100 + this.cpu.stack, (this.cpu.pcount >> 8) & 0x00FF)
        this.cpu.stack = forceUInt8(this.cpu.stack - 1)

        this.cpu.write(0x0100 + this.cpu.stack, this.cpu.pcount & 0x00FF)
        this.cpu.stack = forceUInt8(this.cpu.stack - 1)
        this.cpu.setFlag(this.cpu.FLAG.B, true)

        this.cpu.write(0x0100 + this.cpu.stack, this.cpu.status)
        this.cpu.stack = forceUInt8(this.cpu.stack - 1)
        this.cpu.setFlag(this.cpu.FLAG.B, false)
    
        this.cpu.pcount = forceUInt16(this.cpu.read(0xFFFE)) | (forceUInt16(this.cpu.read(0xFFFF)) << 8)

        return 0
    }

    // Instruction: Branch if Overflow Clear
    // Function:    if(V == 0) pc = address
    bvc(){
        printLogInstruction("Opcode mode BVC executed!")
        return this.branch( this.cpu.getFlag(this.cpu.FLAG.V) == 0 )
    }

    // Instruction: Branch if Overflow Set
    // Function:    if(V == 1) pc = address
    bvs(){
        printLogInstruction("Opcode mode BVS executed!")
        return this.branch( this.cpu.getFlag(this.cpu.FLAG.V) == 1 )
    }

    // Instruction: Clear Carry Flag
    // Function:    C = 0
    clc(){
        printLogInstruction("Opcode mode CLC executed!")
        this.cpu.setFlag(this.cpu.FLAG.C, false)
        return 0
    }

    // Instruction: Clear Decimal Flag
    // Function:    D = 0
    cld(){
        printLogInstruction("Opcode mode CLD executed!")
        this.cpu.setFlag(this.cpu.FLAG.D, false)
        return 0
    }

    // Instruction: Disable Interrupts / Clear Interrupt Flag
    // Function:    I = 0
    cli(){
        printLogInstruction("Opcode mode CLI executed!")
        this.cpu.setFlag(this.cpu.FLAG.I, false)
        return 0
    }

    // Instruction: Clear Overflow Flag
    // Function:    V = 0
    clv(){
        printLogInstruction("Opcode mode CLV executed!")
        this.cpu.setFlag(this.cpu.FLAG.V, false)
        return 0
    }

    cmp(){
        printLogInstruction("Opcode mode CMP executed!")
    }

    cpx(){
        printLogInstruction("Opcode mode CPX executed!")
    }

    cpy(){
        printLogInstruction("Opcode mode CPY executed!")
    }

    dec(){
        printLogInstruction("Opcode mode DEC executed!")
    }

    // Instruction: Decrement X Register
    // Function:    X = X - 1
    // Flags Out:   N, Z
    dex(){
        printLogInstruction("Opcode mode DEX executed!")

        this.cpu.reg_x = forceUInt8( this.cpu.reg_x - 1 )
        
        this.cpu.setFlag(this.cpu.FLAG.Z, this.cpu.reg_x == 0x00)
        this.cpu.setFlag(this.cpu.FLAG.N, this.cpu.reg_x & 0x80)

        return 0
    }

    // Instruction: Decrement Y Register
    // Function:    Y = Y - 1
    // Flags Out:   N, Z
    dey(){
        printLogInstruction("Opcode mode DEY executed!")

        this.cpu.reg_y = forceUInt8( this.cpu.reg_y - 1 )
        
        this.cpu.setFlag(this.cpu.FLAG.Z, this.cpu.reg_y == 0x00)
        this.cpu.setFlag(this.cpu.FLAG.N, this.cpu.reg_y & 0x80)

        return 0
    }

    eor(){
        printLogInstruction("Opcode mode EOR executed!")
    }

    inc(){
        printLogInstruction("Opcode mode INC executed!")
    }

    inx(){
        printLogInstruction("Opcode mode INX executed!")
    }

    iny(){
        printLogInstruction("Opcode mode INY executed!")
    }

    jmp(){
        printLogInstruction("Opcode mode JMP executed!")
    }

    jsr(){
        printLogInstruction("Opcode mode JSR executed!")
    }

    // Instruction: Load The Accumulator
    // Function:    A = M
    // Flags Out:   N, Z
    lda(){
        printLogInstruction("Opcode mode LDA executed!")

        this.cpu.fetch()

        this.cpu.acc = this.cpu.fetched
        
        this.cpu.setFlag(this.cpu.FLAG.Z, this.cpu.acc == 0x00)
        this.cpu.setFlag(this.cpu.FLAG.N, this.cpu.acc & 0x80)

        return 1
    }

    // Instruction: Load The X Register
    // Function:    X = M
    // Flags Out:   N, Z
    ldx(){
        printLogInstruction("Opcode mode LDX executed!")

        this.cpu.fetch()

        this.cpu.reg_x = this.cpu.fetched
        
        this.cpu.setFlag(this.cpu.FLAG.Z, this.cpu.reg_x == 0x00)
        this.cpu.setFlag(this.cpu.FLAG.N, this.cpu.reg_x & 0x80)

        return 1
    }
    
    // Instruction: Load The Y Register
    // Function:    Y = M
    // Flags Out:   N, Z
    ldy(){
        printLogInstruction("Opcode mode LDY executed!")

        this.cpu.fetch()

        this.cpu.reg_y = this.cpu.fetched
        
        this.cpu.setFlag(this.cpu.FLAG.Z, this.cpu.reg_y == 0x00)
        this.cpu.setFlag(this.cpu.FLAG.N, this.cpu.reg_y & 0x80)

        return 1
    }

    lsr(){
        printLogInstruction("Opcode mode LSR executed!")
    }

    nop(){
        printLogInstruction("Opcode mode NOP executed!")
    }

    // Instruction: Bitwise Logic OR
    // Function:    A = A | M
    // Flags Out:   N, Z
    ora(){
        printLogInstruction("Opcode mode ORA executed!")

        this.cpu.fetch()

        this.cpu.acc = this.cpu.acc | this.cpu.fetched

        this.cpu.setFlag(this.cpu.FLAG.Z, this.cpu.acc == 0x00)
        this.cpu.setFlag(this.cpu.FLAG.N, this.cpu.acc & 0x80)

        return 1
    }

    // Instruction: Push Accumulator to Stack
    // Function:    A -> stack
    pha(){
        printLogInstruction("Opcode mode PHA executed!")

        this.cpu.write(0x0100 + this.cpu.stack, this.cpu.acc)
        this.cpu.stack = forceUInt8(this.cpu.stack - 1)

        return 0
    }

    php(){
        printLogInstruction("Opcode mode PHP executed!")
    }

    // Instruction: Pop Accumulator off Stack
    // Function:    A <- stack
    // Flags Out:   N, Z
    pla(){
        printLogInstruction("Opcode mode PLA executed!")

        this.cpu.stack = forceUInt8(this.cpu.stack + 1)
        this.cpu.acc = this.cpu.read(0x0100 + this.cpu.stack)

        this.cpu.setFlag(this.cpu.FLAG.Z, this.cpu.acc == 0x00)
        this.cpu.setFlag(this.cpu.FLAG.N, this.cpu.acc & 0x80)

        return 0
    }

    plp(){
        printLogInstruction("Opcode mode PLP executed!")
    }

    rol(){
        printLogInstruction("Opcode mode ROL executed!")
    }

    ror(){
        printLogInstruction("Opcode mode ROR executed!")
    }

    //
    rti(){
        printLogInstruction("Opcode mode RTI executed!")

        this.cpu.stack = forceUInt8(this.cpu.stack + 1)        
        this.cpu.status = this.cpu.read(0x0100 + this.cpu.stack)
        this.cpu.status &= ~this.cpu.FLAG.B
        this.cpu.status &= ~this.cpu.FLAG.U
    
        this.cpu.stack = forceUInt8(this.cpu.stack + 1)
        this.cpu.pcount = forceUInt16( this.cpu.read(0x0100 + this.cpu.stack) )

        this.cpu.stack = forceUInt8(this.cpu.stack + 1)
        this.cpu.pcount |= forceUInt16( this.cpu.read(0x0100 + this.cpu.stack) << 8 )

        return 0
    }

    rts(){
        printLogInstruction("Opcode mode RTS executed!")
    }

    // Instruction: Subtraction with Borrow In
    // Function:    A = A - M - (1 - C)
    // Flags Out:   C, V, N, Z
    sbc(){
        printLogInstruction("Opcode mode SBC executed!")

        this.cpu.fetch()
	
        // Operating in 16-bit domain to capture carry out
        
        // We can invert the bottom 8 bits with bitwise xor
        let value = forceUInt16( forceUInt16(this.cpu.fetched) ^ 0x00FF )
        
        // Notice this is exactly the same as addition from here!
        let temp = forceUInt16( forceUInt16(this.cpu.acc) + value + forceUInt16(this.cpu.getFlag(this.cpu.FLAG.C)) )

        this.cpu.setFlag(this.cpu.FLAG.C, temp & 0xFF00)
        this.cpu.setFlag(this.cpu.FLAG.Z, ((temp & 0x00FF) == 0))
        this.cpu.setFlag(this.cpu.FLAG.V, (temp ^ forceUInt16(this.cpu.acc)) & (temp ^ value) & 0x0080)
        this.cpu.setFlag(this.cpu.FLAG.N, temp & 0x0080)

        this.cpu.acc = temp & 0x00FF 

        return 1
    }

    sec(){
        printLogInstruction("Opcode mode SEC executed!")
    }

    sed(){
        printLogInstruction("Opcode mode SED executed!")
    }

    sei(){
        printLogInstruction("Opcode mode SEI executed!")
    }

    // Instruction: Store Accumulator at Address
    // Function:    M = A
    sta(){
        printLogInstruction("Opcode mode STA executed!")

        this.cpu.write(this.cpu.addr_abs, this.cpu.acc)

        return 0
    }

    // Instruction: Store X Register at Address
    // Function:    M = X
    stx(){
        printLogInstruction("Opcode mode STX executed!")

        this.cpu.write(this.cpu.addr_abs, this.cpu.reg_x)

        return 0
    }

    // Instruction: Store Y Register at Address
    // Function:    M = Y
    sty(){
        printLogInstruction("Opcode mode STY executed!")

        this.cpu.write(this.cpu.addr_abs, this.cpu.reg_y)

        return 0
    }

    tax(){
        printLogInstruction("Opcode mode TAX executed!")
    }

    tay(){
        printLogInstruction("Opcode mode TAY executed!")
    }

    tsx(){
        printLogInstruction("Opcode mode TSX executed!")
    }

    txa(){
        printLogInstruction("Opcode mode TXA executed!")
    }

    txs(){
        printLogInstruction("Opcode mode TXS executed!")
    }

    tya(){
        printLogInstruction("Opcode mode TYA executed!")
    }

    xxx(){
        printLogInstruction("Opcode mode XXX executed!")
    }
}