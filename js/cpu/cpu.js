//-------------------------------------------------------------
//                            CPU
//-------------------------------------------------------------
class Cpu{
    FLAG = {
        C: (1 << 0), Z: (1 << 1), I: (1 << 2), D: (1 << 3),
        B: (1 << 4), U: (1 << 5), V: (1 << 6), N: (1 << 7),
    }

    constructor(){
        // Bus
        this.bus = undefined

        // Registers
        this.acc    = 0x00
        this.reg_x  = 0x00
        this.reg_y  = 0x00
        this.stack  = 0x00
        this.pcount = 0x0000
        this.status = 0x00

        // Assisstive variables to facilitate emulation
        this.fetched     = 0x00
        this.addr_abs    = 0x0000
        this.addr_rel    = 0x0000
        this.opcode      = 0x00
        this.cycles      = 0x00
        this.clock_count = 0

        // Classes ref.
        this.opcode_type = new OpCode(this)
        this.address_type = new Address(this)

        // Lookup
        this.lookup = [
            new Instruction("brk", this.opcode_type.brk, this.address_type.imm, 7 ),
            new Instruction("ora", this.opcode_type.ora, this.address_type.izx, 6 ),
            new Instruction("xxx", this.opcode_type.xxx, this.address_type.imp, 2 ),
            new Instruction("xxx", this.opcode_type.xxx, this.address_type.imp, 8 ),
            new Instruction("nop", this.opcode_type.nop, this.address_type.imp, 3 ),
            new Instruction("ora", this.opcode_type.ora, this.address_type.zp0, 3 ),
            new Instruction("asl", this.opcode_type.asl, this.address_type.zp0, 5 ),
            new Instruction("xxx", this.opcode_type.xxx, this.address_type.imp, 5 ),
            new Instruction("php", this.opcode_type.php, this.address_type.imp, 3 ),
            new Instruction("ora", this.opcode_type.ora, this.address_type.imm, 2 ),
            new Instruction("asl", this.opcode_type.asl, this.address_type.imp, 2 ),
            new Instruction("xxx", this.opcode_type.xxx, this.address_type.imp, 2 ),
            new Instruction("nop", this.opcode_type.nop, this.address_type.imp, 4 ),
            new Instruction("ora", this.opcode_type.ora, this.address_type.abs, 4 ),
            new Instruction("asl", this.opcode_type.asl, this.address_type.abs, 6 ),
            new Instruction("xxx", this.opcode_type.xxx, this.address_type.imp, 6 ),
            new Instruction("bpl", this.opcode_type.bpl, this.address_type.rel, 2 ),
            new Instruction("ora", this.opcode_type.ora, this.address_type.izy, 5 ),
            new Instruction("xxx", this.opcode_type.xxx, this.address_type.imp, 2 ),
            new Instruction("xxx", this.opcode_type.xxx, this.address_type.imp, 8 ),
            new Instruction("nop", this.opcode_type.nop, this.address_type.imp, 4 ),
            new Instruction("ora", this.opcode_type.ora, this.address_type.zpx, 4 ),
            new Instruction("asl", this.opcode_type.asl, this.address_type.zpx, 6 ),
            new Instruction("xxx", this.opcode_type.xxx, this.address_type.imp, 6 ),
            new Instruction("clc", this.opcode_type.clc, this.address_type.imp, 2 ),
            new Instruction("ora", this.opcode_type.ora, this.address_type.aby, 4 ),
            new Instruction("nop", this.opcode_type.nop, this.address_type.imp, 2 ),
            new Instruction("xxx", this.opcode_type.xxx, this.address_type.imp, 7 ),
            new Instruction("nop", this.opcode_type.nop, this.address_type.imp, 4 ),
            new Instruction("ora", this.opcode_type.ora, this.address_type.abx, 4 ),
            new Instruction("asl", this.opcode_type.asl, this.address_type.abx, 7 ),
            new Instruction("xxx", this.opcode_type.xxx, this.address_type.imp, 7 ),
            new Instruction("jsr", this.opcode_type.jsr, this.address_type.abs, 6 ),
            new Instruction("and", this.opcode_type.and, this.address_type.izx, 6 ),
            new Instruction("xxx", this.opcode_type.xxx, this.address_type.imp, 2 ),
            new Instruction("xxx", this.opcode_type.xxx, this.address_type.imp, 8 ),
            new Instruction("bit", this.opcode_type.bit, this.address_type.zp0, 3 ),
            new Instruction("and", this.opcode_type.and, this.address_type.zp0, 3 ),
            new Instruction("rol", this.opcode_type.rol, this.address_type.zp0, 5 ),
            new Instruction("xxx", this.opcode_type.xxx, this.address_type.imp, 5 ),
            new Instruction("plp", this.opcode_type.plp, this.address_type.imp, 4 ),
            new Instruction("and", this.opcode_type.and, this.address_type.imm, 2 ),
            new Instruction("rol", this.opcode_type.rol, this.address_type.imp, 2 ),
            new Instruction("xxx", this.opcode_type.xxx, this.address_type.imp, 2 ),
            new Instruction("bit", this.opcode_type.bit, this.address_type.abs, 4 ),
            new Instruction("and", this.opcode_type.and, this.address_type.abs, 4 ),
            new Instruction("rol", this.opcode_type.rol, this.address_type.abs, 6 ),
            new Instruction("xxx", this.opcode_type.xxx, this.address_type.imp, 6 ),
            new Instruction("bmi", this.opcode_type.bmi, this.address_type.rel, 2 ),
            new Instruction("and", this.opcode_type.and, this.address_type.izy, 5 ),
            new Instruction("xxx", this.opcode_type.xxx, this.address_type.imp, 2 ),
            new Instruction("xxx", this.opcode_type.xxx, this.address_type.imp, 8 ),
            new Instruction("nop", this.opcode_type.nop, this.address_type.imp, 4 ),
            new Instruction("and", this.opcode_type.and, this.address_type.zpx, 4 ),
            new Instruction("rol", this.opcode_type.rol, this.address_type.zpx, 6 ),
            new Instruction("xxx", this.opcode_type.xxx, this.address_type.imp, 6 ),
            new Instruction("sec", this.opcode_type.sec, this.address_type.imp, 2 ),
            new Instruction("and", this.opcode_type.and, this.address_type.aby, 4 ),
            new Instruction("nop", this.opcode_type.nop, this.address_type.imp, 2 ),
            new Instruction("xxx", this.opcode_type.xxx, this.address_type.imp, 7 ),
            new Instruction("nop", this.opcode_type.nop, this.address_type.imp, 4 ),
            new Instruction("and", this.opcode_type.and, this.address_type.abx, 4 ),
            new Instruction("rol", this.opcode_type.rol, this.address_type.abx, 7 ),
            new Instruction("xxx", this.opcode_type.xxx, this.address_type.imp, 7 ),
            new Instruction("rti", this.opcode_type.rti, this.address_type.imp, 6 ),
            new Instruction("eor", this.opcode_type.eor, this.address_type.izx, 6 ),
            new Instruction("xxx", this.opcode_type.xxx, this.address_type.imp, 2 ),
            new Instruction("xxx", this.opcode_type.xxx, this.address_type.imp, 8 ),
            new Instruction("nop", this.opcode_type.nop, this.address_type.imp, 3 ),
            new Instruction("eor", this.opcode_type.eor, this.address_type.zp0, 3 ),
            new Instruction("lsr", this.opcode_type.lsr, this.address_type.zp0, 5 ),
            new Instruction("xxx", this.opcode_type.xxx, this.address_type.imp, 5 ),
            new Instruction("pha", this.opcode_type.pha, this.address_type.imp, 3 ),
            new Instruction("eor", this.opcode_type.eor, this.address_type.imm, 2 ),
            new Instruction("lsr", this.opcode_type.lsr, this.address_type.imp, 2 ),
            new Instruction("xxx", this.opcode_type.xxx, this.address_type.imp, 2 ),
            new Instruction("jmp", this.opcode_type.jmp, this.address_type.abs, 3 ),
            new Instruction("eor", this.opcode_type.eor, this.address_type.abs, 4 ),
            new Instruction("lsr", this.opcode_type.lsr, this.address_type.abs, 6 ),
            new Instruction("xxx", this.opcode_type.xxx, this.address_type.imp, 6 ),
            new Instruction("bvc", this.opcode_type.bvc, this.address_type.rel, 2 ),
            new Instruction("eor", this.opcode_type.eor, this.address_type.izy, 5 ),
            new Instruction("xxx", this.opcode_type.xxx, this.address_type.imp, 2 ),
            new Instruction("xxx", this.opcode_type.xxx, this.address_type.imp, 8 ),
            new Instruction("nop", this.opcode_type.nop, this.address_type.imp, 4 ),
            new Instruction("eor", this.opcode_type.eor, this.address_type.zpx, 4 ),
            new Instruction("lsr", this.opcode_type.lsr, this.address_type.zpx, 6 ),
            new Instruction("xxx", this.opcode_type.xxx, this.address_type.imp, 6 ),
            new Instruction("cli", this.opcode_type.cli, this.address_type.imp, 2 ),
            new Instruction("eor", this.opcode_type.eor, this.address_type.aby, 4 ),
            new Instruction("nop", this.opcode_type.nop, this.address_type.imp, 2 ),
            new Instruction("xxx", this.opcode_type.xxx, this.address_type.imp, 7 ),
            new Instruction("nop", this.opcode_type.nop, this.address_type.imp, 4 ),
            new Instruction("eor", this.opcode_type.eor, this.address_type.abx, 4 ),
            new Instruction("lsr", this.opcode_type.lsr, this.address_type.abx, 7 ),
            new Instruction("xxx", this.opcode_type.xxx, this.address_type.imp, 7 ),
            new Instruction("rts", this.opcode_type.rts, this.address_type.imp, 6 ),
            new Instruction("adc", this.opcode_type.adc, this.address_type.izx, 6 ),
            new Instruction("xxx", this.opcode_type.xxx, this.address_type.imp, 2 ),
            new Instruction("xxx", this.opcode_type.xxx, this.address_type.imp, 8 ),
            new Instruction("nop", this.opcode_type.nop, this.address_type.imp, 3 ),
            new Instruction("adc", this.opcode_type.adc, this.address_type.zp0, 3 ),
            new Instruction("ror", this.opcode_type.ror, this.address_type.zp0, 5 ),
            new Instruction("xxx", this.opcode_type.xxx, this.address_type.imp, 5 ),
            new Instruction("pla", this.opcode_type.pla, this.address_type.imp, 4 ),
            new Instruction("adc", this.opcode_type.adc, this.address_type.imm, 2 ),
            new Instruction("ror", this.opcode_type.ror, this.address_type.imp, 2 ),
            new Instruction("xxx", this.opcode_type.xxx, this.address_type.imp, 2 ),
            new Instruction("jmp", this.opcode_type.jmp, this.address_type.ind, 5 ),
            new Instruction("adc", this.opcode_type.adc, this.address_type.abs, 4 ),
            new Instruction("ror", this.opcode_type.ror, this.address_type.abs, 6 ),
            new Instruction("xxx", this.opcode_type.xxx, this.address_type.imp, 6 ),
            new Instruction("bvs", this.opcode_type.bvs, this.address_type.rel, 2 ),
            new Instruction("adc", this.opcode_type.adc, this.address_type.izy, 5 ),
            new Instruction("xxx", this.opcode_type.xxx, this.address_type.imp, 2 ),
            new Instruction("xxx", this.opcode_type.xxx, this.address_type.imp, 8 ),
            new Instruction("nop", this.opcode_type.nop, this.address_type.imp, 4 ),
            new Instruction("adc", this.opcode_type.adc, this.address_type.zpx, 4 ),
            new Instruction("ror", this.opcode_type.ror, this.address_type.zpx, 6 ),
            new Instruction("xxx", this.opcode_type.xxx, this.address_type.imp, 6 ),
            new Instruction("sei", this.opcode_type.sei, this.address_type.imp, 2 ),
            new Instruction("adc", this.opcode_type.adc, this.address_type.aby, 4 ),
            new Instruction("nop", this.opcode_type.nop, this.address_type.imp, 2 ),
            new Instruction("xxx", this.opcode_type.xxx, this.address_type.imp, 7 ),
            new Instruction("nop", this.opcode_type.nop, this.address_type.imp, 4 ),
            new Instruction("adc", this.opcode_type.adc, this.address_type.abx, 4 ),
            new Instruction("ror", this.opcode_type.ror, this.address_type.abx, 7 ),
            new Instruction("xxx", this.opcode_type.xxx, this.address_type.imp, 7 ),
            new Instruction("nop", this.opcode_type.nop, this.address_type.imp, 2 ),
            new Instruction("sta", this.opcode_type.sta, this.address_type.izx, 6 ),
            new Instruction("nop", this.opcode_type.nop, this.address_type.imp, 2 ),
            new Instruction("xxx", this.opcode_type.xxx, this.address_type.imp, 6 ),
            new Instruction("sty", this.opcode_type.sty, this.address_type.zp0, 3 ),
            new Instruction("sta", this.opcode_type.sta, this.address_type.zp0, 3 ),
            new Instruction("stx", this.opcode_type.stx, this.address_type.zp0, 3 ),
            new Instruction("xxx", this.opcode_type.xxx, this.address_type.imp, 3 ),
            new Instruction("dey", this.opcode_type.dey, this.address_type.imp, 2 ),
            new Instruction("nop", this.opcode_type.nop, this.address_type.imp, 2 ),
            new Instruction("txa", this.opcode_type.txa, this.address_type.imp, 2 ),
            new Instruction("xxx", this.opcode_type.xxx, this.address_type.imp, 2 ),
            new Instruction("sty", this.opcode_type.sty, this.address_type.abs, 4 ),
            new Instruction("sta", this.opcode_type.sta, this.address_type.abs, 4 ),
            new Instruction("stx", this.opcode_type.stx, this.address_type.abs, 4 ),
            new Instruction("xxx", this.opcode_type.xxx, this.address_type.imp, 4 ),
            new Instruction("bcc", this.opcode_type.bcc, this.address_type.rel, 2 ),
            new Instruction("sta", this.opcode_type.sta, this.address_type.izy, 6 ),
            new Instruction("xxx", this.opcode_type.xxx, this.address_type.imp, 2 ),
            new Instruction("xxx", this.opcode_type.xxx, this.address_type.imp, 6 ),
            new Instruction("sty", this.opcode_type.sty, this.address_type.zpx, 4 ),
            new Instruction("sta", this.opcode_type.sta, this.address_type.zpx, 4 ),
            new Instruction("stx", this.opcode_type.stx, this.address_type.zpy, 4 ),
            new Instruction("xxx", this.opcode_type.xxx, this.address_type.imp, 4 ),
            new Instruction("tya", this.opcode_type.tya, this.address_type.imp, 2 ),
            new Instruction("sta", this.opcode_type.sta, this.address_type.aby, 5 ),
            new Instruction("txs", this.opcode_type.txs, this.address_type.imp, 2 ),
            new Instruction("xxx", this.opcode_type.xxx, this.address_type.imp, 5 ),
            new Instruction("nop", this.opcode_type.nop, this.address_type.imp, 5 ),
            new Instruction("sta", this.opcode_type.sta, this.address_type.abx, 5 ),
            new Instruction("xxx", this.opcode_type.xxx, this.address_type.imp, 5 ),
            new Instruction("xxx", this.opcode_type.xxx, this.address_type.imp, 5 ),
            new Instruction("ldy", this.opcode_type.ldy, this.address_type.imm, 2 ),
            new Instruction("lda", this.opcode_type.lda, this.address_type.izx, 6 ),
            new Instruction("ldx", this.opcode_type.ldx, this.address_type.imm, 2 ),
            new Instruction("xxx", this.opcode_type.xxx, this.address_type.imp, 6 ),
            new Instruction("ldy", this.opcode_type.ldy, this.address_type.zp0, 3 ),
            new Instruction("lda", this.opcode_type.lda, this.address_type.zp0, 3 ),
            new Instruction("ldx", this.opcode_type.ldx, this.address_type.zp0, 3 ),
            new Instruction("xxx", this.opcode_type.xxx, this.address_type.imp, 3 ),
            new Instruction("tay", this.opcode_type.tay, this.address_type.imp, 2 ),
            new Instruction("lda", this.opcode_type.lda, this.address_type.imm, 2 ),
            new Instruction("tax", this.opcode_type.tax, this.address_type.imp, 2 ),
            new Instruction("xxx", this.opcode_type.xxx, this.address_type.imp, 2 ),
            new Instruction("ldy", this.opcode_type.ldy, this.address_type.abs, 4 ),
            new Instruction("lda", this.opcode_type.lda, this.address_type.abs, 4 ),
            new Instruction("ldx", this.opcode_type.ldx, this.address_type.abs, 4 ),
            new Instruction("xxx", this.opcode_type.xxx, this.address_type.imp, 4 ),
            new Instruction("bcs", this.opcode_type.bcs, this.address_type.rel, 2 ),
            new Instruction("lda", this.opcode_type.lda, this.address_type.izy, 5 ),
            new Instruction("xxx", this.opcode_type.xxx, this.address_type.imp, 2 ),
            new Instruction("xxx", this.opcode_type.xxx, this.address_type.imp, 5 ),
            new Instruction("ldy", this.opcode_type.ldy, this.address_type.zpx, 4 ),
            new Instruction("lda", this.opcode_type.lda, this.address_type.zpx, 4 ),
            new Instruction("ldx", this.opcode_type.ldx, this.address_type.zpy, 4 ),
            new Instruction("xxx", this.opcode_type.xxx, this.address_type.imp, 4 ),
            new Instruction("clv", this.opcode_type.clv, this.address_type.imp, 2 ),
            new Instruction("lda", this.opcode_type.lda, this.address_type.aby, 4 ),
            new Instruction("tsx", this.opcode_type.tsx, this.address_type.imp, 2 ),
            new Instruction("xxx", this.opcode_type.xxx, this.address_type.imp, 4 ),
            new Instruction("ldy", this.opcode_type.ldy, this.address_type.abx, 4 ),
            new Instruction("lda", this.opcode_type.lda, this.address_type.abx, 4 ),
            new Instruction("ldx", this.opcode_type.ldx, this.address_type.aby, 4 ),
            new Instruction("xxx", this.opcode_type.xxx, this.address_type.imp, 4 ),
            new Instruction("cpy", this.opcode_type.cpy, this.address_type.imm, 2 ),
            new Instruction("cmp", this.opcode_type.cmp, this.address_type.izx, 6 ),
            new Instruction("nop", this.opcode_type.nop, this.address_type.imp, 2 ),
            new Instruction("xxx", this.opcode_type.xxx, this.address_type.imp, 8 ),
            new Instruction("cpy", this.opcode_type.cpy, this.address_type.zp0, 3 ),
            new Instruction("cmp", this.opcode_type.cmp, this.address_type.zp0, 3 ),
            new Instruction("dec", this.opcode_type.dec, this.address_type.zp0, 5 ),
            new Instruction("xxx", this.opcode_type.xxx, this.address_type.imp, 5 ),
            new Instruction("iny", this.opcode_type.iny, this.address_type.imp, 2 ),
            new Instruction("cmp", this.opcode_type.cmp, this.address_type.imm, 2 ),
            new Instruction("dex", this.opcode_type.dex, this.address_type.imp, 2 ),
            new Instruction("xxx", this.opcode_type.xxx, this.address_type.imp, 2 ),
            new Instruction("cpy", this.opcode_type.cpy, this.address_type.abs, 4 ),
            new Instruction("cmp", this.opcode_type.cmp, this.address_type.abs, 4 ),
            new Instruction("dec", this.opcode_type.dec, this.address_type.abs, 6 ),
            new Instruction("xxx", this.opcode_type.xxx, this.address_type.imp, 6 ),
            new Instruction("bne", this.opcode_type.bne, this.address_type.rel, 2 ),
            new Instruction("cmp", this.opcode_type.cmp, this.address_type.izy, 5 ),
            new Instruction("xxx", this.opcode_type.xxx, this.address_type.imp, 2 ),
            new Instruction("xxx", this.opcode_type.xxx, this.address_type.imp, 8 ),
            new Instruction("nop", this.opcode_type.nop, this.address_type.imp, 4 ),
            new Instruction("cmp", this.opcode_type.cmp, this.address_type.zpx, 4 ),
            new Instruction("dec", this.opcode_type.dec, this.address_type.zpx, 6 ),
            new Instruction("xxx", this.opcode_type.xxx, this.address_type.imp, 6 ),
            new Instruction("cld", this.opcode_type.cld, this.address_type.imp, 2 ),
            new Instruction("cmp", this.opcode_type.cmp, this.address_type.aby, 4 ),
            new Instruction("nop", this.opcode_type.nop, this.address_type.imp, 2 ),
            new Instruction("xxx", this.opcode_type.xxx, this.address_type.imp, 7 ),
            new Instruction("nop", this.opcode_type.nop, this.address_type.imp, 4 ),
            new Instruction("cmp", this.opcode_type.cmp, this.address_type.abx, 4 ),
            new Instruction("dec", this.opcode_type.dec, this.address_type.abx, 7 ),
            new Instruction("xxx", this.opcode_type.xxx, this.address_type.imp, 7 ),
            new Instruction("cpx", this.opcode_type.cpx, this.address_type.imm, 2 ),
            new Instruction("sbc", this.opcode_type.sbc, this.address_type.izx, 6 ),
            new Instruction("nop", this.opcode_type.nop, this.address_type.imp, 2 ),
            new Instruction("xxx", this.opcode_type.xxx, this.address_type.imp, 8 ),
            new Instruction("cpx", this.opcode_type.cpx, this.address_type.zp0, 3 ),
            new Instruction("sbc", this.opcode_type.sbc, this.address_type.zp0, 3 ),
            new Instruction("inc", this.opcode_type.inc, this.address_type.zp0, 5 ),
            new Instruction("xxx", this.opcode_type.xxx, this.address_type.imp, 5 ),
            new Instruction("inx", this.opcode_type.inx, this.address_type.imp, 2 ),
            new Instruction("sbc", this.opcode_type.sbc, this.address_type.imm, 2 ),
            new Instruction("nop", this.opcode_type.nop, this.address_type.imp, 2 ),
            new Instruction("sbc", this.opcode_type.sbc, this.address_type.imp, 2 ),
            new Instruction("cpx", this.opcode_type.cpx, this.address_type.abs, 4 ),
            new Instruction("sbc", this.opcode_type.sbc, this.address_type.abs, 4 ),
            new Instruction("inc", this.opcode_type.inc, this.address_type.abs, 6 ),
            new Instruction("xxx", this.opcode_type.xxx, this.address_type.imp, 6 ),
            new Instruction("beq", this.opcode_type.beq, this.address_type.rel, 2 ),
            new Instruction("sbc", this.opcode_type.sbc, this.address_type.izy, 5 ),
            new Instruction("xxx", this.opcode_type.xxx, this.address_type.imp, 2 ),
            new Instruction("xxx", this.opcode_type.xxx, this.address_type.imp, 8 ),
            new Instruction("nop", this.opcode_type.nop, this.address_type.imp, 4 ),
            new Instruction("sbc", this.opcode_type.sbc, this.address_type.zpx, 4 ),
            new Instruction("inc", this.opcode_type.inc, this.address_type.zpx, 6 ),
            new Instruction("xxx", this.opcode_type.xxx, this.address_type.imp, 6 ),
            new Instruction("sed", this.opcode_type.sed, this.address_type.imp, 2 ),
            new Instruction("sbc", this.opcode_type.sbc, this.address_type.aby, 4 ),
            new Instruction("nop", this.opcode_type.nop, this.address_type.imp, 2 ),
            new Instruction("xxx", this.opcode_type.xxx, this.address_type.imp, 7 ),
            new Instruction("nop", this.opcode_type.nop, this.address_type.imp, 4 ),
            new Instruction("sbc", this.opcode_type.sbc, this.address_type.abx, 4 ),
            new Instruction("inc", this.opcode_type.inc, this.address_type.abx, 7 ),
            new Instruction("xxx", this.opcode_type.xxx, this.address_type.imp, 7 )            
        ]

        printLog("CPU as created!")
    }

    connectBus(bus){
        this.bus = bus
        printLog("BUS as connected at CPU!")
    }

    write(addr, data){
        printLog("CPU call BUS write!")
        this.bus.write(addr, data)
    }

    read(addr, isReadOnly = false){
        printLog("CPU call BUS read!")
        return this.bus.read(addr, isReadOnly)
    }

    getFlag(f){
        if ( (this.status & f) > 0 )
            return 1
        
        return 0
    }

    setFlag(f, v){
        if (v) this.status |= f
        else this.status &= ~f
    }

    clock(){

        if (this.cycles == 0){
            this.opcode = this.read(this.pcount)

            this.setFlag(this.FLAG.U, true)

            this.pcount++

            // Pega o valor inicial de ciclos
            this.cycles = this.lookup[this.opcode].cycles

            // Chamar a função com a referencia desta classe
            let additional_cycle_1 = forceUInt8( this.lookup[this.opcode].addr_mode.call(this.address_type) )
            let additional_cycle_2 = forceUInt8( this.lookup[this.opcode].operate.call(this.opcode_type) )

            this.cycles += (additional_cycle_1 & additional_cycle_2)

            this.setFlag(this.FLAG.U, true)
        }

        this.cycles--

        //printLog("CPU has clocked. Cycles: " + this.cycles)
    }

    reset(){
        printLog("CPU as reseted!")

        // Reset registers
        this.acc   = 0
        this.reg_x = 0
        this.reg_y = 0
        this.stack = 0xFD
        this.status = 0x00 | this.FLAG.U

        this.addr_abs = 0xFFFC
        let low  = forceUInt16( this.read(this.addr_abs + 0) )
        let high = forceUInt16( this.read(this.addr_abs + 1) )

        this.pcount = (high << 8) | low

        this.addr_rel = 0
        this.addr_abs = 0
        this.fetched  = 0

        this.cycles = 8
    }

    irq(){
        if (this.getFlag(this.FLAG.I) == 0){
            // Push the program counter to the stack. It's 16-bits dont
            // forget so that takes two pushes
            this.write(0x0100 + this.stack, (this.pcount >> 8) & 0x00FF)
            this.stack--

            this.write(0x0100 + this.stack, this.pcount & 0x00FF)
            this.stack--

            // Then Push the status register to the stack
            this.setFlag(this.FLAG.B, 0)
            this.setFlag(this.FLAG.U, 1)
            this.setFlag(this.FLAG.I, 1)

            this.write(0x0100 + this.stack, this.status)
            this.stack--

            // Read new program counter location from fixed address
            this.addr_abs = 0xFFFE
            let low  = forceUInt16( this.read(this.addr_abs + 0) )
            let high = forceUInt16( this.read(this.addr_abs + 1) )
            this.pcount = (high << 8) | low

            // IRQs take time
            this.cycles = 7
        }        
    }

    nmi(){
        if (this.getFlag(this.FLAG.I) == 0){
            this.write(0x0100 + this.stack, (this.pcount >> 8) & 0x00FF)
            this.stack--

            this.write(0x0100 + this.stack, this.pcount & 0x00FF)
            this.stack--

            this.setFlag(this.FLAG.B, 0)
            this.setFlag(this.FLAG.U, 1)
            this.setFlag(this.FLAG.I, 1)

            this.write(0x0100 + this.stack, this.status)
            this.stack--

            this.addr_abs = 0xFFFA
            let low  = forceUInt16( this.read(this.addr_abs + 0) )
            let high = forceUInt16( this.read(this.addr_abs + 1) )
            this.pcount = (high << 8) | low

            this.cycles = 8
        }  
    }

    fetch(){
        if (!(this.lookup[this.opcode].addr_mode == this.opcode_type.imp))
            this.fetched = this.read(this.addr_abs)

        return this.fetched
    }

    ///////////////////////////////////////////////////////////////////////////////
    // HELPER FUNCTIONS

    complete(){
        return this.cycles == 0;
    }

    disassemble(n_start, n_stop){  
        let is_log_enabled = show_log_all         
        
        show_log_all = false

        const mapLines = {}
        let addr = n_start
        let value = 0x00, lo = 0x00, hi = 0x00
        let line_addr = 0

        while (addr <= n_stop){
            line_addr = addr;

            // Prefix line with instruction address
            let sInst = "$" + toHex(addr, 4) + ": ";

            // Read instruction, and get its readable name
            let _opcode = this.bus.read(addr, true); addr++;
            sInst += this.lookup[_opcode].name + " ";

            if (this.lookup[_opcode].addr_mode == this.address_type.imp){
                sInst += " {IMP}";

            } else if (this.lookup[_opcode].addr_mode == this.address_type.imm){
                value = this.bus.read(addr, true); addr++;
                sInst += "#$" + toHex(value, 2) + " {IMM}";
            
            } else if (this.lookup[_opcode].addr_mode == this.opcode_type.zp0){
                lo = this.bus.read(addr, true); addr++;
                hi = 0x00;												
                sInst += "$" + toHex(lo, 2) + " {ZP0}";
            }

            else if (this.lookup[_opcode].addr_mode == this.opcode_type.zpx){
                lo = this.bus.read(addr, true); addr++;
                hi = 0x00;														
                sInst += "$" + toHex(lo, 2) + ", X {ZPX}";
            }

            else if (this.lookup[_opcode].addr_mode == this.opcode_type.zpy){
                lo = this.bus.read(addr, true); addr++;
                hi = 0x00;														
                sInst += "$" + toHex(lo, 2) + ", Y {ZPY}";
            }

            else if (this.lookup[_opcode].addr_mode == this.opcode_type.izx){
                lo = this.bus.read(addr, true); addr++;
                hi = 0x00;								
                sInst += "($" + toHex(lo, 2) + ", X) {IZX}";
            }

            else if (this.lookup[_opcode].addr_mode == this.opcode_type.izy){
                lo = this.bus.read(addr, true); addr++;
                hi = 0x00;								
                sInst += "($" + toHex(lo, 2) + "), Y {IZY}";
            }

            else if (this.lookup[_opcode].addr_mode == this.opcode_type.abs){
                lo = this.bus.read(addr, true); addr++;
                hi = this.bus.read(addr, true); addr++;
                sInst += "$" + toHex((uint16_t)(hi << 8) | lo, 4) + " {ABS}";
            }

            else if (this.lookup[_opcode].addr_mode == this.opcode_type.abx){
                lo = this.bus.read(addr, true); addr++;
                hi = this.bus.read(addr, true); addr++;
                sInst += "$" + toHex((uint16_t)(hi << 8) | lo, 4) + ", X {ABX}";
            }

            else if (this.lookup[_opcode].addr_mode == this.opcode_type.aby){
                lo = this.bus.read(addr, true); addr++;
                hi = this.bus.read(addr, true); addr++;
                sInst += "$" + toHex((uint16_t)(hi << 8) | lo, 4) + ", Y {ABY}";
            }

            else if (this.lookup[_opcode].addr_mode == this.opcode_type.ind){
                lo = this.bus.read(addr, true); addr++;
                hi = this.bus.read(addr, true); addr++;
                sInst += "($" + toHex((uint16_t)(hi << 8) | lo, 4) + ") {IND}";
            }

            else if (this.lookup[_opcode].addr_mode == this.opcode_type.rel){
                value = this.bus.read(addr, true); addr++;
                sInst += "$" + toHex(value, 2) + " [$" + toHex(addr + value, 4) + "] {REL}";
            }

            mapLines[line_addr] = sInst;
        }
                   
        show_log_all = is_log_enabled

        return mapLines;
    }
}