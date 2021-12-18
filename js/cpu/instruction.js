
//---------------------------------
//   Instructions Modes
//---------------------------------
class Instruction{
    constructor(name, operate, addr_mode, cycles = 0){
        this.name = name
        this.operate = operate
        this.addr_mode = addr_mode
        this.cycles = cycles
    }
}