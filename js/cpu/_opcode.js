
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
        printLog("Opcode mode ADC executed!")

        // Grab the data that we are adding to the accumulator
        this.cpu.fetch()
        
        // Add is performed in 16-bit domain for emulation to capture any
        // carry bit, which will exist in bit 8 of the 16-bit word
        var temp = forceUInt16( 
            forceUInt16(this.cpu.acc) + 
            forceUInt16(this.cpu.fetched) + 
            forceUInt16(this.cpu.getFlag(this.cpu.FLAG.C)) 
        ) 
   
        // The carry flag out exists in the high byte bit 0
        this.cpu.setFlag(this.cpu.FLAG.C, temp > 255)
        
        // The Zero flag is set if the result is 0
        this.cpu.setFlag(this.cpu.FLAG.Z, (temp & 0x00FF) == 0)
        
        // The signed Overflow flag is set based on all that up there! :D
        var a_xor_fetched = forceUInt16(this.cpu.acc) ^ forceUInt16(this.cpu.fetched)
        var a_xor_temp    = forceUInt16(this.cpu.acc) ^ forceUInt16(temp)
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
        printLog("Opcode mode AND executed!")

        this.cpu.fetch()

        this.cpu.acc = this.cpu.acc & this.cpu.fetched

        this.cpu.setFlag(this.cpu.FLAG.Z, this.cpu.acc == 0x00)
        this.cpu.setFlag(this.cpu.FLAG.N, this.cpu.acc & 0x80)

        return 1
    }

    asl(){
        printLog("Opcode mode ASL executed!")
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
        printLog("Opcode mode BCC executed!")
        return this.branch( this.cpu.getFlag(this.cpu.FLAG.C) == 0 )
    }

    // Instruction: Branch if Carry Set
    // Function:    if(C == 1) pc = address
    bcs(){
        printLog("Opcode mode BCS executed!")
        return this.branch( this.cpu.getFlag(this.cpu.FLAG.C) == 1 )
    }

    // Instruction: Branch if Equal
    // Function:    if(Z == 1) pc = address
    beq(){
        printLog("Opcode mode BEQ executed!")
        return this.branch( this.cpu.getFlag(this.cpu.FLAG.Z) == 1 )
    }

    bit(){
        printLog("Opcode mode BIT executed!")
    }

    // Instruction: Branch if Negative
    // Function:    if(N == 1) pc = address
    bmi(){
        printLog("Opcode mode BMI executed!")
        return this.branch( this.cpu.getFlag(this.cpu.FLAG.N) == 1 )
    }

    // Instruction: Branch if Not Equal
    // Function:    if(Z == 0) pc = address
    bne(){
        printLog("Opcode mode BNE executed!")
        return this.branch( this.cpu.getFlag(this.cpu.FLAG.Z) == 0 )
    }

    // Instruction: Branch if Positive
    // Function:    if(N == 0) pc = address
    bpl(){
        printLog("Opcode mode BPL executed!")
        return this.branch( this.cpu.getFlag(this.cpu.FLAG.N) == 0 )
    }

    brk(){
        printLog("Opcode mode BRK executed!")
    }

    // Instruction: Branch if Overflow Clear
    // Function:    if(V == 0) pc = address
    bvc(){
        printLog("Opcode mode BVC executed!")
        return this.branch( this.cpu.getFlag(this.cpu.FLAG.V) == 0 )
    }

    // Instruction: Branch if Overflow Set
    // Function:    if(V == 1) pc = address
    bvs(){
        printLog("Opcode mode BVS executed!")
        return this.branch( this.cpu.getFlag(this.cpu.FLAG.V) == 1 )
    }

    // Instruction: Clear Carry Flag
    // Function:    C = 0
    clc(){
        printLog("Opcode mode CLC executed!")
        this.cpu.setFlag(this.cpu.FLAG.C, false)
        return 0
    }

    // Instruction: Clear Decimal Flag
    // Function:    D = 0
    cld(){
        printLog("Opcode mode CLD executed!")
        this.cpu.setFlag(this.cpu.FLAG.D, false)
        return 0
    }

    // Instruction: Disable Interrupts / Clear Interrupt Flag
    // Function:    I = 0
    cli(){
        printLog("Opcode mode CLI executed!")
        this.cpu.setFlag(this.cpu.FLAG.I, false)
        return 0
    }

    // Instruction: Clear Overflow Flag
    // Function:    V = 0
    clv(){
        printLog("Opcode mode CLV executed!")
        this.cpu.setFlag(this.cpu.FLAG.V, false)
        return 0
    }

    cmp(){
        printLog("Opcode mode CMP executed!")
    }

    cpx(){
        printLog("Opcode mode CPX executed!")
    }

    cpy(){
        printLog("Opcode mode CPY executed!")
    }

    dec(){
        printLog("Opcode mode DEC executed!")
    }

    dex(){
        printLog("Opcode mode DEX executed!")
    }

    dey(){
        printLog("Opcode mode DEY executed!")
    }

    eor(){
        printLog("Opcode mode EOR executed!")
    }

    inc(){
        printLog("Opcode mode INC executed!")
    }

    inx(){
        printLog("Opcode mode INX executed!")
    }

    iny(){
        printLog("Opcode mode INY executed!")
    }

    jmp(){
        printLog("Opcode mode JMP executed!")
    }

    jsr(){
        printLog("Opcode mode JSR executed!")
    }

    lda(){
        printLog("Opcode mode LDA executed!")
    }

    ldx(){
        printLog("Opcode mode LDX executed!")
    }
    
    ldy(){
        printLog("Opcode mode LDY executed!")
    }

    lsr(){
        printLog("Opcode mode LSR executed!")
    }

    nop(){
        printLog("Opcode mode NOP executed!")
    }

    ora(){
        printLog("Opcode mode ORA executed!")
    }

    // Instruction: Push Accumulator to Stack
    // Function:    A -> stack
    pha(){
        printLog("Opcode mode PHA executed!")

        this.cpu.write(0x0100 + this.cpu.stack, this.cpu.acc)
        this.cpu.stack--

        return 0
    }

    php(){
        printLog("Opcode mode PHP executed!")
    }

    // Instruction: Pop Accumulator off Stack
    // Function:    A <- stack
    // Flags Out:   N, Z
    pla(){
        printLog("Opcode mode PLA executed!")

        this.cpu.stack++
        this.cpu.acc = this.cpu.read(0x0100 + this.cpu.stack)

        this.cpu.setFlag(this.cpu.FLAG.Z, this.cpu.acc == 0x00)
        this.cpu.setFlag(this.cpu.FLAG.N, this.cpu.acc & 0x80)

        return 0
    }

    plp(){
        printLog("Opcode mode PLP executed!")
    }

    rol(){
        printLog("Opcode mode ROL executed!")
    }

    ror(){
        printLog("Opcode mode ROR executed!")
    }

    //
    rti(){
        printLog("Opcode mode RTI executed!")

        this.cpu.stack++
        this.cpu.status = this.cpu.read(0x0100 + this.cpu.stack)
        this.cpu.status &= ~this.cpu.FLAG.B
        this.cpu.status &= ~this.cpu.FLAG.U
    
        this.cpu.stack++
        this.cpu.pcount = forceUInt16( this.cpu.read(0x0100 + this.cpu.stack) )

        this.cpu.stack++
        this.cpu.pcount |= forceUInt16( this.cpu.read(0x0100 + this.cpu.stack) << 8 )

        return 0
    }

    rts(){
        printLog("Opcode mode RTS executed!")
    }

    // Instruction: Subtraction with Borrow In
    // Function:    A = A - M - (1 - C)
    // Flags Out:   C, V, N, Z
    sbc(){
        printLog("Opcode mode SBC executed!")

        this.cpu.fetch()
	
        // Operating in 16-bit domain to capture carry out
        
        // We can invert the bottom 8 bits with bitwise xor
        var value = forceUInt16( forceUInt16(this.cpu.fetched) ^ 0x00FF )
        
        // Notice this is exactly the same as addition from here!
        var temp = forceUInt16( forceUInt16(this.cpu.acc) + value + forceUInt16(this.cpu.getFlag(this.cpu.FLAG.C)) )

        this.cpu.setFlag(this.cpu.FLAG.C, temp & 0xFF00)
        this.cpu.setFlag(this.cpu.FLAG.Z, ((temp & 0x00FF) == 0))
        this.cpu.setFlag(this.cpu.FLAG.V, (temp ^ forceUInt16(this.cpu.acc)) & (temp ^ value) & 0x0080)
        this.cpu.setFlag(this.cpu.FLAG.N, temp & 0x0080)

        this.cpu.acc = temp & 0x00FF 

        return 1
    }

    sec(){
        printLog("Opcode mode SEC executed!")
    }

    sed(){
        printLog("Opcode mode SED executed!")
    }

    sei(){
        printLog("Opcode mode SEI executed!")
    }

    sta(){
        printLog("Opcode mode STA executed!")
    }

    stx(){
        printLog("Opcode mode STX executed!")
    }

    sty(){
        printLog("Opcode mode STY executed!")
    }

    tax(){
        printLog("Opcode mode TAX executed!")
    }

    tay(){
        printLog("Opcode mode TAY executed!")
    }

    tsx(){
        printLog("Opcode mode TSX executed!")
    }

    txa(){
        printLog("Opcode mode TXA executed!")
    }

    txs(){
        printLog("Opcode mode TXS executed!")
    }

    tya(){
        printLog("Opcode mode TYA executed!")
    }

    xxx(){
        printLog("Opcode mode XXX executed!")
    }
}