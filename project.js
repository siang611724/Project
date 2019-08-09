// 動物的物件
var blockData = [
    {selector: ".block1",name: "1",pitch: "dog"},
    {selector: ".block2",name: "2",pitch: "elephant"},
    {selector: ".block3",name: "3",pitch: "sheep"},
    {selector: ".block4",name: "4",pitch: "cow"},
    {selector: ".block5",name: "5",pitch: "pikachu"},
    {selector: ".block6",name: "6",pitch: "cat"},
    {selector: ".block7",name: "7",pitch: "duck"},
    {selector: ".block8",name: "8",pitch: "lion"},
]
// 聲音物件
var soundData = [
    {name: "correct", notes: ["correct"]},
    {name: "wrong", notes: ["wrong"],}
]
// 關卡
var levelData = [
    "1234",
    "4213566",
    "23741686657",
    "872417865374126",
    // "334512",
    // "1246654",
    // "2136543",
    // "52134645",
    // "236745632",
    // "5647123413",
    // "7532716433",
    // "53481624514",
    // "136247857644",
    // "8624753133612",
    // "32854761264315",
    // "872417865374126",
    // "331241562824747245418236164153"
]
// 動物的各種屬性
var Blocks = function(blockFile,noteFile){
    this.blocks = blockFile.map((data,index)=>{
        return {
            name: data.name,
            el: $(data.selector),
            audio: this.getAudio(data.pitch),
        }
    })
    this.sounds = noteFile.map((data,index)=>{
        return {
            name: data.name,
            sound: data.notes.map((pitch)=>{
                return this.getAudio(pitch)
            })
        }

    })
}
// 讓當前按到的動物放大
Blocks.prototype.zoom = function(note){
    var block = this.blocks.find(data=>data.name==note)
    if (block) {
        block.audio.currentTime = 0
        block.audio.play()
        // block.audio.volume = 0.2
        block.el.addClass("active")
        setTimeout(function(){
            block.el.removeClass("active")
        },100)
    }
}
Blocks.prototype.getAudio = function(pitch){
    return new Audio("./audio/"+ pitch +".wav")
}
// 播放回答正確/錯誤的音效
Blocks.prototype.playSound= function(voice){
    var tone = this.sounds.find(set=>set.name==voice).sound
    tone.forEach(function(obj){
        obj.currentTime = 0
        obj.play()
    })
}
// 遊戲的各種屬性
var score = 0
var Game = function(){
    this.blocks = new Blocks(blockData,soundData)
    this.level = levelData
    this.nowLevel = 0
    this.mode = "waiting"
}
// 顯示當前關卡並開始
Game.prototype.startLevel = function(){
    this.showLevel("Level " + this.nowLevel)
    var levels = this.level[this.nowLevel]
    this.startGame(levels)
    this.Harder()
}
Game.prototype.showLevel = function(msg){
    // console.log(msg)
    $(".status").text(msg)
}
// 顯示回答結果(正確或錯誤)
Game.prototype.showResult = function(msg){
    $(".result").text(msg)
}
// 開始遊戲
Game.prototype.startGame = function(answer){
    this.mode = "playing"
    this.answer = answer
    var tones = this.answer.split("")
    this.answerStatus("")
    var timer = setInterval(()=>{
        var char = tones.shift()
        this.playTone(char)
        if (tones.length == 0){
            console.log("audio play end")
            this.startUserInput()
            clearInterval(timer)
        }
    },900)
}
// 讓當前所按到的動物放大並播放聲音
Game.prototype.playTone = function(note){
    console.log(note)
    this.blocks.zoom(note)
}
// 開始使用者輸入
Game.prototype.startUserInput = function(){
    this.userInput = ""
    this.mode = "userInput"
}
// 傳入使用者輸入的答案並比對答案是否正確
Game.prototype.sendUserInput = function(inputChar){
    if (this.mode == "userInput"){
        var tempChar = this.userInput + inputChar 
        this.playTone(inputChar)
        this.answerStatus(tempChar)
        if (this.answer.indexOf(tempChar) == 0){
            console.log("good")
            score += 5
            $(".point").text("Score: " + score)
            if(this.answer == tempChar){
                this.correctSound()
                score += 20
                $(".point").text("Score: " + score)
                if (this.nowLevel < 3){
                    this.nowLevel += 1
                    this.mode = "waiting"
                    setTimeout(()=>{
                        this.startLevel()
                        this.showResult("")
                        $(".block").removeClass("bingo")
                    },1000)
                }else {
                    this.nowLevel = this.nowLevel
                    setTimeout(()=>{
                        this.gameEnd()
                    },1500)
                }             
            }
        }else {
            this.wrongSound()
            if(this.nowLevel != 0){
                this.nowLevel -= 1
            }else {
                this.nowLevel = 0
            }
            score -= 30
            $(".point").text("Score: " + score)
            this.mode = "waiting"
            if (score <= 0){
                score = 0
                $(".point").text("Score: " + score)
            }
            setTimeout(()=>{
                this.startLevel()
                this.showResult("")
                $(".block").removeClass("error")
            },1000)
        }
        console.log(tempChar)
        this.userInput += inputChar
    }
}
// 顯示回答狀態
Game.prototype.answerStatus = function(tempChar){
    $(".inputStatus").html("")
    this.answer.split("").forEach(function(data,index){
        var circle = $("<div class='circle'></div>")
        if (index < tempChar.length){
            circle.addClass("correct")
        }
        $(".inputStatus").append(circle)
    })
    if (tempChar == this.answer){
        $(".inputStatus").addClass("proper")
    }else {
        $(".inputStatus").removeClass("proper")
    }
    if (this.answer.indexOf(tempChar)!= 0){
        $(".inputStatus").addClass("wrong")
    }else {
        $(".inputStatus").removeClass("wrong")
    }
}
// 回答正確後播放特定音效並顯示回答結果
Game.prototype.correctSound = function(){
    setTimeout(()=>{
        this.showResult("Bingo!")
        this.blocks.playSound("correct")
        $(".block").addClass("bingo")
    },500)
}
// 答錯後播放特定音效並顯示回答結果
Game.prototype.wrongSound = function(){
    setTimeout(()=>{
        this.showResult("You Wrong.")
        this.blocks.playSound("wrong")
        $(".block").addClass("error")
        $(".result").css("color","#ff6d6d")
    },100)
}
// 初始畫面 點下開始按鈕進入倒數並開始遊戲
Game.prototype.clickToStart = function(){
    var time = 3
    var _this = this
    $("button,p").hide()
    var countdown = setInterval(function(){
        $("h2").text(time)
        time--
        if (time < 0){
            clearInterval(countdown)
            $(".gameInfo").hide()
            $(".blocks,.infos").css("visibility","visible")
            _this.startLevel()
            _this.startUserInput()
        }
    },1000)
}
// 到達指定關卡增加難度
Game.prototype.Harder = function(){
    $(".block5,.block6,.block7,.block8").hide()
    // if (this.nowLevel > 1 && this.nowLevel <=4){
    //     $(".block5").show()
    //     $(".block").css({
    //         "width": "180px",
    //         "height": "180px"
    //     })
    // }else if (this.nowLevel > 4 && this.nowLevel <=7){
    //     $(".block5,.block6").show()
    //     $(".block").css({
    //         "width": "180px",
    //         "height": "180px"
    //     })
    // }else if (this.nowLevel > 7 && this.nowLevel <10){
    //     $(".block5,.block6,.block7").show()
    //     $(".block").css({
    //         "width": "150px",
    //         "height": "150px"
    //     })
    // }else if (this.nowLevel >= 10){
    //     $(".block5,.block6,.block7,.block8").show()
    //     $(".block").css({
    //         "width": "150px",
    //         "height": "150px"
    //     })
    // }else {
    //     $(".block").css({
    //         "width": "200px",
    //         "height": "200px"
    //     })
    // }
    if (this.nowLevel >= 1 && this.nowLevel < 2){
        $(".block5,.block6").show()
        $(".block").css({
            "width": "180px",
            "height": "180px"
        })
    }else if (this.nowLevel >= 2 && this.nowLevel < 3){
        $(".block5,.block6,.block7,.block8").show()
        $(".block").css({
            "width": "150px",
            "height": "150px"
        })
    }else {
        $(".block").css({
            "width": "200px",
            "height": "200px"
        })
    }
}
Game.prototype.gameEnd = function(){
    $(".infos,.inputStatus").hide()
    $(".end").css("opacity","1").text("Game End")
    $(".block").show().css("position","relative").removeAttr("onclick")
    function animalMove(){
        $(".block").each(function(){
            $(this).animate({
                left: -250 + Math.round(Math.random() * 300) + "px",
                top: -150 + Math.round(Math.random() * 300) + "px",
            },2000)
        })
    }
    setInterval(animalMove,1000)
}
var game = new Game()