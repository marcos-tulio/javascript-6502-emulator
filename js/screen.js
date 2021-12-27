//-------------------------------------------------------------
//                         Screen
//-------------------------------------------------------------
class Screen{

    constructor(cpu){
        this.cpu = cpu

        // Table config.
        this.size_x = 25
        this.size_y = 20
        this.title_size = 40
        this.padding = 10

        // ASM Map
        this.map_asm = []
    }

    init(){
        // init asm mapper 
        this.map_asm = this.cpu.disassemble(0x0000, 0xFFFF)            

        // Canvas config.
        const lstCanvas = document.getElementsByTagName("canvas");
        for (let i = 0; i < lstCanvas.length; i++)
            lstCanvas[i].getContext("2d").font = "12px monospace"

        this.refresh()
    }

    getCanvasClearned(id){
        const canvas = document.getElementById(id)
        const context = canvas.getContext("2d")

        context.clearRect(0, 0, canvas.width, canvas.height);

        return canvas
    }

    updateRam(id, address, cols = 16, rows = 16){
        const ctx = this.getCanvasClearned(id).getContext("2d")

        let row = 0
        let col = 0            
        for (let i = address; i < this.cpu.bus.ram.length; i++){
            if (i % cols == 0){
                col = 0
                row++

                if (row > rows) break;
            }

            if (col == 0)
                ctx.fillText("$" + toHex(i, 4), col++ * this.size_x + this.padding, row * this.size_y)
            
            ctx.fillText(toHex(this.cpu.bus.ram[i]), col++ * this.size_x + this.title_size, row * this.size_y)  
        }  
    }

    updateCpu(id = "cpu"){
        const ctx = this.getCanvasClearned(id).getContext("2d")
        
        let flags = Object.entries(this.cpu.FLAG)
        for (let i = 0; i < flags.length; i++) {
            ctx.fillStyle = (flags[i][1] & this.cpu.status) > 0 ? "green" : "red"
            ctx.fillText(flags[i][0], (i) * this.size_x + this.padding, this.size_y)
        }


        // Registers
        ctx.fillStyle = "black"
        ctx.fillText("PC: $" + toHex(this.cpu.pcount, 4), this.padding, this.size_y * 2)
        ctx.fillText("SP: $" + toHex(this.cpu.stack, 2), this.padding, this.size_y * 3)
        ctx.fillText(" A: $" + toHex(this.cpu.acc, 2)   + " ("+ this.cpu.acc   + ")", this.padding, this.size_y * 4)
        ctx.fillText(" X: $" + toHex(this.cpu.reg_x, 2) + " ("+ this.cpu.reg_x + ")", this.padding, this.size_y * 5)
        ctx.fillText(" Y: $" + toHex(this.cpu.reg_y, 2) + " ("+ this.cpu.reg_y + ")", this.padding, this.size_y * 6)
    }

    updateDisassemble(lines = 10, id = "debugger"){
        const ctx = this.getCanvasClearned(id).getContext("2d")

        const offsets = []
        let offset_selected = undefined
        let down_lines = parseInt(lines / 2);

        // down check
        for (let i = this.cpu.pcount; i >= 0; i--) {
            if (this.map_asm[i]){
                offsets.push(i)
                if (!offset_selected) offset_selected = i
                if (!down_lines--) break
            }
        }

        // up check
        for (let i = this.cpu.pcount + 1; i < 0xFFFF; i++) {
            if (this.map_asm[i]){
                offsets.push(i)
                if (offsets.length == lines) break
            }
        }

        // draw codes
        let line = 1
        for (const _offset of offsets.sort( function(a,b) { return a - b; } )) {
            ctx.fillStyle = (_offset == offset_selected) ? "green" : "black"
            ctx.fillText(this.map_asm[_offset], this.padding, line++ * this.size_y)
        }
    }

    // This function needs can be overrided
    refresh(){}

}