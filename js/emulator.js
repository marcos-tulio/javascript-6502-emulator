//-------------------------------------------------------------
//                          Emulator
//-------------------------------------------------------------
class Emulator{

    constructor(){
        this.cpu = new Cpu()
        this.bus = new Bus(this.cpu)
        this.screen = new Screen(this.cpu)   
        
        // Source
        this.source_offset = 0x8000
        this.source = [
            0xA2, 0x0A, 0x8E, 0x00, 0x00, 0xA2, 0x03, 0x8E, 0x01, 0x00, 
            0xAC, 0x00, 0x00, 0xA9, 0x00, 0x18, 0x6D, 0x01, 0x00, 0x88, 
            0xD0, 0xFA, 0x8D, 0x02, 0x00, 0xEA, 0xEA, 0xEA
        ]
    }

    init(){
        // clear ram
        for (const i in this.bus.ram)
            this.bus.ram[i] = 0x00

        // load code to ram            
        let offset = this.source_offset
        for (const b of this.source) 
            this.bus.ram[offset++] = b

        // reset vectors
        this.bus.ram[0xFFFC] = 0x00;
        this.bus.ram[0xFFFD] = 0x80;

        // reset
        this.cpu.reset()
        this.screen.init()
    }

    runAuto(btn, is_call_back = false, context = this){
        if (!is_call_back){
            btn.textContent = (btn.textContent == "Run") ? "Stop" : "Run"
        }
        
        if (btn.textContent == "Stop"){
            context.runManual()
            setTimeout(context.runAuto, document.getElementById("interval").value, btn, true, context)
        }
    }

    runManual(){
        do this.cpu.clock()
        while (!this.cpu.complete())

        this.screen.refresh()
    }

    async loadRom(file){
        const array_buffer = await (new Response(file)).arrayBuffer()
        this.source = new Uint8Array(array_buffer)

        this.screen.init()
    }
}


