
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

    // Instruction: Arithmetic Shift Left
    // Function:    A = C <- (A << 1) <- 0
    // Flags Out:   N, Z, C
    asl(){
        printLogInstruction("Opcode mode ASL executed!")

        this.cpu.fetch()

        let temp = forceUInt16( this.cpu.fetched << 1 )

        this.cpu.setFlag(this.cpu.FLAG.C, (temp & 0xFF00) > 0)
        this.cpu.setFlag(this.cpu.FLAG.Z, (temp & 0x00FF) == 0x00)
        this.cpu.setFlag(this.cpu.FLAG.N, temp & 0x80)

        if (this.cpu.lookup[this.cpu.opcode].addr_mode == this.cpu.address_type.imp)
            this.cpu.acc = temp & 0x00FF;
        else
            this.cpu.write(this.cpu.addr_abs, temp & 0x00FF)

        return 0
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

    // Instruction:
    // Function:
    bit(){
        printLogInstruction("Opcode mode BIT executed!")

        this.cpu.fetch()

        let temp = forceUInt16( this.cpu.acc & this.cpu.fetched )

        this.cpu.setFlag(this.cpu.FLAG.Z, (temp & 0x00FF) == 0x00)
        this.cpu.setFlag(this.cpu.FLAG.N, this.cpu.fetched & (1 << 7))
        this.cpu.setFlag(this.cpu.FLAG.V, this.cpu.fetched & (1 << 6))

        return 0
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

    // Instruction: Compare Accumulator
    // Function:    C <- A >= M      Z <- (A - M) == 0
    // Flags Out:   N, C, Z
    cmp(){
        printLogInstruction("Opcode mode CMP executed!")

        this.cpu.fetch()

        let temp = forceUInt16( this.cpu.acc - this.cpu.fetched )

        this.cpu.setFlag(this.cpu.FLAG.Z, (temp & 0x00FF) == 0x00)
        this.cpu.setFlag(this.cpu.FLAG.N, temp & 0x0080)
        this.cpu.setFlag(this.cpu.FLAG.C, this.cpu.acc >= this.cpu.fetched)

        return 1
    }

    // Instruction: Compare X Register
    // Function:    C <- X >= M      Z <- (X - M) == 0
    // Flags Out:   N, C, Z
    cpx(){
        printLogInstruction("Opcode mode CPX executed!")

        this.cpu.fetch()

        let temp = forceUInt16( this.cpu.reg_x - this.cpu.fetched )

        this.cpu.setFlag(this.cpu.FLAG.Z, (temp & 0x00FF) == 0x00)
        this.cpu.setFlag(this.cpu.FLAG.N, temp & 0x0080)
        this.cpu.setFlag(this.cpu.FLAG.C, this.cpu.reg_x >= this.cpu.fetched)

        return 0
    }

    // Instruction: Compare Y Register
    // Function:    C <- Y >= M      Z <- (Y - M) == 0
    // Flags Out:   N, C, Z
    cpy(){
        printLogInstruction("Opcode mode CPY executed!")

        this.cpu.fetch()

        let temp = forceUInt16( this.cpu.reg_y - this.cpu.fetched )

        this.cpu.setFlag(this.cpu.FLAG.Z, (temp & 0x00FF) == 0x00)
        this.cpu.setFlag(this.cpu.FLAG.N, temp & 0x0080)
        this.cpu.setFlag(this.cpu.FLAG.C, this.cpu.reg_y >= this.cpu.fetched)

        return 0
    }

    // Instruction: Decrement Value at Memory Location
    // Function:    M = M - 1
    // Flags Out:   N, Z
    dec(){
        printLogInstruction("Opcode mode DEC executed!")

        this.cpu.fetch()

        let temp = forceUInt16( this.cpu.fetched - 1 )

        this.cpu.write(this.cpu.addr_abs, temp & 0x00FF)

        this.cpu.setFlag(this.cpu.FLAG.Z, (temp & 0x00FF) == 0x00)
        this.cpu.setFlag(this.cpu.FLAG.N, temp & 0x0080)

        return 0
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

    // Instruction: Bitwise Logic XOR
    // Function:    A = A xor M
    // Flags Out:   N, Z
    eor(){
        printLogInstruction("Opcode mode EOR executed!")

        this.cpu.fetch()

        this.cpu.acc = forceUInt8( this.cpu.acc ^ this.cpu.fetched )

        this.cpu.setFlag(this.cpu.FLAG.Z, this.cpu.acc == 0x00)
        this.cpu.setFlag(this.cpu.FLAG.N, this.cpu.acc & 0x80)

        return 1
    }

    // Instruction: Increment Value at Memory Location
    // Function:    M = M + 1
    // Flags Out:   N, Z
    inc(){
        printLogInstruction("Opcode mode INC executed!")

        this.cpu.fetch()

        let temp = forceUInt16( this.cpu.fetched + 1 )

        this.cpu.write(this.cpu.addr_abs, temp & 0x00FF)

        this.cpu.setFlag(this.cpu.FLAG.Z, (temp & 0x00FF) == 0x00)
        this.cpu.setFlag(this.cpu.FLAG.N, temp & 0x0080)

        return 0
    }

    // Instruction: Increment X Register
    // Function:    X = X + 1
    // Flags Out:   N, Z
    inx(){
        printLogInstruction("Opcode mode INX executed!")

        this.cpu.reg_x = forceUInt8( this.cpu.reg_x + 1 )
        
        this.cpu.setFlag(this.cpu.FLAG.Z, this.cpu.reg_x == 0x00)
        this.cpu.setFlag(this.cpu.FLAG.N, this.cpu.reg_x & 0x80)

        return 0
    }

    // Instruction: Increment Y Register
    // Function:    Y = Y + 1
    // Flags Out:   N, Z
    iny(){
        printLogInstruction("Opcode mode INY executed!")

        this.cpu.reg_y = forceUInt8( this.cpu.reg_y + 1 )
        
        this.cpu.setFlag(this.cpu.FLAG.Z, this.cpu.reg_y == 0x00)
        this.cpu.setFlag(this.cpu.FLAG.N, this.cpu.reg_y & 0x80)

        return 0
    }

    // Instruction: Jump To Location
    // Function:    pc = address
    jmp(){
        printLogInstruction("Opcode mode JMP executed!")

        this.cpu.pcount = forceUInt16( this.cpu.addr_abs )

        return 0
    }

    // Instruction: Jump To Sub-Routine
    // Function:    Push current pc to stack, pc = address
    jsr(){
        printLogInstruction("Opcode mode JSR executed!")

        this.cpu.pcount = forceUInt16( this.cpu.pcount - 1 )

        this.cpu.write(0x0100 + this.cpu.stack, (this.cpu.pcount >> 8) & 0x00FF)
        this.cpu.stack = forceUInt8( this.cpu.stack - 1 )

        this.cpu.write(0x0100 + this.cpu.stack, this.cpu.pcount & 0x00FF)
        this.cpu.stack = forceUInt8( this.cpu.stack - 1 )
    
        this.cpu.pcount = forceUInt16( this.cpu.addr_abs )

        return 0
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

    // Instruction:
    // Function:
    lsr(){
        printLogInstruction("Opcode mode LSR executed!")

        this.cpu.fetch()

        this.cpu.setFlag(this.cpu.FLAG.C, this.cpu.fetched & 0x0001)

        let temp = forceUInt16( this.cpu.fetched >> 1 )

        this.cpu.setFlag(this.cpu.FLAG.Z, (temp & 0x00FF) == 0x00)
        this.cpu.setFlag(this.cpu.FLAG.N, temp & 0x80)

        if (this.cpu.lookup[this.cpu.opcode].addr_mode == this.cpu.address_type.imp)
            this.cpu.acc = temp & 0x00FF;
        else
            this.cpu.write(this.cpu.addr_abs, temp & 0x00FF)

        return 0
    }

    // Instruction:
    // Function:
    nop(){
        printLogInstruction("Opcode mode NOP executed!")

        switch (this.cpu.opcode) {
            case 0x1C:
            case 0x3C:
            case 0x5C:
            case 0x7C:
            case 0xDC:
            case 0xFC:
                return 1
        }

        return 0
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

    // Instruction: Push Status Register to Stack
    // Function:    status -> stack
    // Note:        Break flag is set to 1 before push
    php(){
        printLogInstruction("Opcode mode PHP executed!")

        this.cpu.write(0x0100 + this.cpu.stack, this.cpu.status | this.cpu.FLAG.B | this.cpu.FLAG.U)

        this.cpu.setFlag(this.cpu.FLAG.B, false)
        this.cpu.setFlag(this.cpu.FLAG.U, false)

        this.cpu.stack = forceUInt8(this.cpu.stack - 1)

        return 0
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

    // Instruction: Pop Status Register off Stack
    // Function:    Status <- stack
    plp(){
        printLogInstruction("Opcode mode PLP executed!")

        this.cpu.stack = forceUInt8(this.cpu.stack + 1)
        this.cpu.status = this.cpu.read(0x0100 + this.cpu.stack)

        this.cpu.setFlag(this.cpu.FLAG.U, true)

        return 0
    }

    // Instruction:
    // Function:
    rol(){
        printLogInstruction("Opcode mode ROL executed!")

        this.cpu.fetch()

        let temp = forceUInt16( this.cpu.fetched << 1 ) | this.cpu.getFlag(this.cpu.FLAG.C)

        this.cpu.setFlag(this.cpu.FLAG.C, temp & 0xFF00)
        this.cpu.setFlag(this.cpu.FLAG.Z, (temp & 0x00FF) == 0x00)
        this.cpu.setFlag(this.cpu.FLAG.N, temp & 0x80)

        if (this.cpu.lookup[this.cpu.opcode].addr_mode == this.cpu.address_type.imp)
            this.cpu.acc = temp & 0x00FF
        else
            this.cpu.write(this.cpu.addr_abs, temp & 0x00FF)

        return 0
    }

    // Instruction:
    // Function:
    ror(){
        printLogInstruction("Opcode mode ROR executed!")

        this.cpu.fetch()

        let temp = forceUInt16( this.cpu.getFlag(this.cpu.FLAG.C) << 7 ) | (this.cpu.fetched >> 1)

        this.cpu.setFlag(this.cpu.FLAG.C, this.cpu.fetched & 0x01)
        this.cpu.setFlag(this.cpu.FLAG.Z, (temp & 0x00FF) == 0x00)
        this.cpu.setFlag(this.cpu.FLAG.N, temp & 0x80)

        if (this.cpu.lookup[this.cpu.opcode].addr_mode == this.cpu.address_type.imp)
            this.cpu.acc = temp & 0x00FF
        else
            this.cpu.write(this.cpu.addr_abs, temp & 0x00FF)

        return 0
    }

    // Instruction:
    // Function:
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

    // Instruction:
    // Function:
    rts(){
        printLogInstruction("Opcode mode RTS executed!")

        this.cpu.stack = forceUInt8(this.cpu.stack + 1)
        this.cpu.pcount = forceUInt16( this.cpu.read(0x0100 + this.cpu.stack) )

        this.cpu.stack = forceUInt8(this.cpu.stack + 1)
        this.cpu.pcount |= forceUInt16( this.cpu.read(0x0100 + this.cpu.stack) << 8 )

        this.cpu.pcount = forceUInt16( this.cpu.pcount + 1)

        return 0
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

    // Instruction: Set Carry Flag
    // Function:    C = 1
    sec(){
        printLogInstruction("Opcode mode SEC executed!")

        this.cpu.setFlag(this.cpu.FLAG.C, true)

        return 0
    }

    // Instruction: Set Decimal Flag
    // Function:    D = 1
    sed(){
        printLogInstruction("Opcode mode SED executed!")

        this.cpu.setFlag(this.cpu.FLAG.D, true)

        return 0
    }

    // Instruction: Set Interrupt Flag / Enable Interrupts
    // Function:    I = 1
    sei(){
        printLogInstruction("Opcode mode SEI executed!")

        this.cpu.setFlag(this.cpu.FLAG.I, true)

        return 0
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

    // Instruction: Transfer Accumulator to X Register
    // Function:    X = A
    // Flags Out:   N, Z
    tax(){
        printLogInstruction("Opcode mode TAX executed!")

        this.cpu.reg_x = this.cpu.acc
        
        this.cpu.setFlag(this.cpu.FLAG.Z, this.cpu.reg_x == 0x00)
        this.cpu.setFlag(this.cpu.FLAG.N, this.cpu.reg_x & 0x80)

        return 0
    }

    // Instruction: Transfer Accumulator to Y Register
    // Function:    Y = A
    // Flags Out:   N, Z
    tay(){
        printLogInstruction("Opcode mode TAY executed!")

        this.cpu.reg_y = this.cpu.acc
        
        this.cpu.setFlag(this.cpu.FLAG.Z, this.cpu.reg_y == 0x00)
        this.cpu.setFlag(this.cpu.FLAG.N, this.cpu.reg_y & 0x80)

        return 0
    }

    // Instruction: Transfer Stack Pointer to X Register
    // Function:    X = stack pointer
    // Flags Out:   N, Z
    tsx(){
        printLogInstruction("Opcode mode TSX executed!")

        this.cpu.reg_x = this.cpu.stack
        
        this.cpu.setFlag(this.cpu.FLAG.Z, this.cpu.reg_x == 0x00)
        this.cpu.setFlag(this.cpu.FLAG.N, this.cpu.reg_x & 0x80)

        return 0
    }

    // Instruction: Transfer X Register to Accumulator
    // Function:    A = X
    // Flags Out:   N, Z
    txa(){
        printLogInstruction("Opcode mode TXA executed!")

        this.cpu.acc = this.cpu.reg_x
        
        this.cpu.setFlag(this.cpu.FLAG.Z, this.cpu.acc == 0x00)
        this.cpu.setFlag(this.cpu.FLAG.N, this.cpu.acc & 0x80)

        return 0
    }

    // Instruction: Transfer X Register to Stack Pointer
    // Function:    stack pointer = X
    txs(){
        printLogInstruction("Opcode mode TXS executed!")

        this.cpu.stack = this.cpu.reg_x

        return 0
    }

    // Instruction: Transfer Y Register to Accumulator
    // Function:    A = Y
    // Flags Out:   N, Z
    tya(){
        printLogInstruction("Opcode mode TYA executed!")

        this.cpu.acc = this.cpu.reg_y
        
        this.cpu.setFlag(this.cpu.FLAG.Z, this.cpu.reg_y == 0x00)
        this.cpu.setFlag(this.cpu.FLAG.N, this.cpu.reg_y & 0x80)

        return 0
    }

    // This function captures illegal opcodes
    xxx(){
        printLogInstruction("Opcode mode XXX executed!")
    }
}