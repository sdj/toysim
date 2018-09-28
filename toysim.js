label = new Object()
opcode = new Object()
adr = new Object()
prog = new Object()
mem = new Object()
accumulator = 0
pc = 0
ninstr = 0

function numbers() {
    s = ""
    for (i = 1; i <= 15; i++) {
        if (i < 10)
            s += " "
        s += i + "\n"
    }
    // document.f.ln.value = s
}

function compile() {
    var i
    prog = document.f.src.value.split(/[\n\r]/)
    for (i = 0; i < prog.length; i++) {
        label[i] = getlab(prog[i])
        if (/get|print|store|load|add|sub|goto|ifpos|ifzero|stop|rand/.test(label[i]))
            warn(i+1, "warning: should '" + label[i] + "' have a space in front of it??")
        opcode[i] = getop(prog[i])
        if (label[i] == "" && opcode[i] != ""
            && !(/get|print|store|load|add|sub|goto|ifpos|ifzero|stop|rand/.test(opcode[i])))
            warn(i+1, "error: '" + opcode[i] + "' doesn't seem to be a valid instruction")
        adr[i] = getadr(prog[i])
        if (adr[i] == "" && /store|load|add|sub|goto|ifpos|ifzero/.test(opcode[i]))
            warn(i+1, "error: you need an operand for this operator: " + prog[i])
        mem[i] = 0
        if (opcode[i] == "init")
            mem[i] = adr[i]
        if (/^-?[0-9]+/.test(opcode[i]))  // opcode is a literal number
            mem[i] = adr[i]
    }
    pc = 0
}

function run() {
    document.f.output.value = ""  // clear output
    document.f.accum.value = ""
    pc = 0
    ninstr = 0
    while (pc >= 0)
        instr()
    out("\nstopped")
}

function instr() {
    ninstr++
    if (ninstr > 1000) {   // avoid infinite loops: stop after 1000 instrs
        out("error: infinite loop?")
        pc = -2
        return
    }
    if (/^#/.test(label[pc]) || /^#/.test(opcode[pc]))
        return
    if (opcode[pc] == "stop")
        pc = -2
    else if (opcode[pc] == "get") {
        accumulator = prompt("Enter value for GET", "")
        accumlator = parseFloat(accumulator)
        if (accumulator == null || accumulator == "")
            pc = -2
    } else if (opcode[pc] == "print")
        out(accumulator)
    else if (opcode[pc] == "store")
        mem[findlab(adr[pc])] = parseFloat(accumulator)
    else if (opcode[pc] == "load")
        accumulator = parseFloat(litoradr(adr[pc]))
    else if (opcode[pc] == "add")
        accumulator = parseFloat(accumulator) + parseFloat(litoradr(adr[pc]))
    else if (opcode[pc] == "sub")
        accumulator = parseFloat(accumulator) - parseFloat(litoradr(adr[pc]))
    else if (opcode[pc] == "goto")
        pc = findlab(adr[pc])-1
    else if (opcode[pc] == "ifpos")
    {if (accumulator >= 0) pc = findlab(adr[pc])-1}
    else if (opcode[pc] == "ifzero")
    {if (parseFloat(accumulator) == 0) pc = findlab(adr[pc])-1}
    else if (opcode[pc] == "init") {
        out("error: tried to execute data at " + (pc+1))
        pc = -2;
    } else if (opcode[pc] == "rand") {
        accumulator = Math.floor(Math.random() * 100);
    } else if (opcode[pc] != "") {
        out("error: invalid instruction '" + opcode[pc] + "' at line " + (pc+1))
        pc = -2;
    }
    pc++
}

function litoradr(s) { // decide if s is a literal or an address
    if (/^-?[0-9]+/.test(s))
        return s
    return mem[findlab(s)]
}

function findlab(s) {
    var i
    for (i = 0; i < prog.length; i++)
        if (label[i] == s)
            return i;
    warn(pc+1, "error: there is no instruction labeled " + s);
    return -1;
}

function getlab(s) {
    lab = s.replace(/ +.*/, "") // zap all but front
    return lab.toLowerCase()
}

function getop(s) {
    var op
    op = s.replace(/^[a-zA-Z][^ ]*/, "") // zap label if present
    op = op.replace(/^[ ]+/, "") // zap leading blanks if present
    op = op.replace(/ +.*/, "") // zap after op
    return op.toLowerCase()
}

function getadr(s) {
    var adr
    adr = s.replace(/^[a-zA-Z][^ ]*/, "") // zap label if present
    adr = adr.replace(/^ *[a-zA-Z][^ ]*/, "") // zap op if present
    adr = adr.replace(/^ +/, "") // zap leading blanks if present
    adr = adr.replace(/ +.*/, "") // zap after adr
    return adr.toLowerCase()
}

function out(s) {
    document.f.output.value += s + "\n"
    document.f.output.scrollTop = document.f.output.scrollHeight
    document.f.accum.value = accumulator
}

function warn(n, s) {
    alert("line " + n + " " + s)
}