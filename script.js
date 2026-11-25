const LUCKY_NAMES = ["admin", "vip", "lucky", "jackpot", "бос", "щасливчик", "переможець", "F2-potuzhno"];
        const MAX_ATTEMPTS = 3;

        const SYMBOLS = [
            {
                id: "seven",
                emoji: "7️⃣"
            },
            {
                id: "apple",
                emoji: "🍎"
            },
            {
                id: "pear",
                emoji: "🍐"
            },
            {
                id: "lemon",
                emoji: "🍋"
            },
            {
                id: "apricot",
                emoji: "🍑"
            },
            {
                id: "cherries",
                emoji: "🍒"
            }
        ];

        let playerName = "User";
        let attempt = 0;
        let isSpinning = false;
        let isGameOver = false;
        let board = [[], [], []];

        const playerNameDisplay = document.getElementById("playerNameDisplay");
        const editNameBtn = document.getElementById("editNameBtn");
        const attemptDisplay = document.getElementById("attemptDisplay");
        const statusBanner = document.getElementById("statusBanner");
        const generateBtn = document.getElementById("generateBtn");
        const resetBtn = document.getElementById("resetBtn");
        const leverAssembly = document.getElementById("leverAssembly");
        const leverTooltip = document.getElementById("leverTooltip");
        const beaconDome = document.getElementById("beaconDome");
        const reelElements = [
            document.getElementById("reel-0"),
            document.getElementById("reel-1"),
            document.getElementById("reel-2")
        ];

        function isLuckyName(name) {
            const cleanName = name.trim().toLowerCase();
            for (let i = 0; i < LUCKY_NAMES.length; i++) {
                if (LUCKY_NAMES[i].toLowerCase() === cleanName) {
                    return true;
                }
            }
            return false;
        }

        function getShuffledSymbols() {
            const copy = SYMBOLS.slice();
            for (let i = copy.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                const temp = copy[i];
                copy[i] = copy[j];
                copy[j] = temp;
            }
            return copy;
        }

        function generateBoard() {
            const newBoard = [[], [], []];
            const luckyBoost = isLuckyName(playerName) && Math.random() < 0.80;

            if (luckyBoost) {
                const winRow = Math.floor(Math.random() * 3);
                const winSymbol = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];

                for (let col = 0; col < 3; col++) {
                    const shuffled = getShuffledSymbols();
                    const others = [];
                    for (let k = 0; k < shuffled.length; k++) {
                        if (shuffled[k].id !== winSymbol.id && others.length < 2) {
                            others.push(shuffled[k]);
                        }
                    }

                    let otherIndex = 0;
                    for (let row = 0; row < 3; row++) {
                        if (row === winRow) {
                            newBoard[col][row] = winSymbol;
                        } else {
                            newBoard[col][row] = others[otherIndex];
                            otherIndex++;
                        }
                    }
                }
            } else {

                for (let col = 0; col < 3; col++) {
                    const shuffled = getShuffledSymbols();
                    newBoard[col] = [shuffled[0], shuffled[1], shuffled[2]];
                }
            }

            return newBoard;
        }

        function renderColumn(colIndex, colSymbols, winRows) {
            const reelEl = reelElements[colIndex];
            reelEl.innerHTML = "";

            for (let row = 0; row < 3; row++) {
                const cell = document.createElement("div");
                cell.className = "reel-cell";
                if (winRows && winRows.indexOf(row) !== -1) {
                    cell.classList.add("win-highlight");
                }
                cell.innerHTML = '<span class="reel-symbol" aria-label="' + colSymbols[row].id + '">' + colSymbols[row].emoji + '</span>';
                reelEl.appendChild(cell);
            }
        }

        function renderAllColumns(gridData, winRows) {
            for (let col = 0; col < 3; col++) {
                renderColumn(col, gridData[col], winRows);
            }
        }

        function updateUI() {
            attemptDisplay.textContent = "Спроба " + attempt + " з " + MAX_ATTEMPTS;
            const disabled = isSpinning || isGameOver || attempt >= MAX_ATTEMPTS;
            generateBtn.disabled = disabled;

            if (disabled) {
                leverAssembly.classList.add("disabled");
            } else {
                leverAssembly.classList.remove("disabled");
            }
        }

        function setStatus(message, statusType) {
            statusBanner.textContent = message;
            statusBanner.className = "status-banner";
            if (statusType === "win") {
                statusBanner.classList.add("win");
            } else if (statusType === "lose") {
                statusBanner.classList.add("lose");
            }
        }

        function askPlayerName(defaultValue) {
            const input = prompt("Введіть ваше ім'я: (п.с спробуйте написати F2-potuzhno)", defaultValue);
            if (input !== null && input.trim() !== "") {
                playerName = input.trim();
            } else if (!playerName) {
                playerName = "User";
            }
            playerNameDisplay.textContent = playerName;
        }

        function animateLever() {
            leverTooltip.style.display = "none";
            leverAssembly.classList.remove("pulled");
            void leverAssembly.offsetWidth;
            leverAssembly.classList.add("pulled");

            setTimeout(function () {
                leverAssembly.classList.remove("pulled");
            }, 340);
        }

        function spinReels() {
            if (isSpinning || isGameOver || attempt >= MAX_ATTEMPTS) {
                return;
            }

            isSpinning = true;
            attempt++;
            updateUI();
            animateLever();
            setStatus("Барабани крутяться... (Спроба " + attempt + " з " + MAX_ATTEMPTS + ")", "");

            const finalBoard = generateBoard();
            board = finalBoard;

            for (let c = 0; c < 3; c++) {
                reelElements[c].classList.add("spinning");
            }

            const spinTimer = setInterval(function () {
                for (let c = 0; c < 3; c++) {
                    if (reelElements[c].classList.contains("spinning")) {
                        const randomCol = getShuffledSymbols().slice(0, 3);
                        renderColumn(c, randomCol, []);
                    }
                }
            }, 90);

            setTimeout(function () {
                reelElements[0].classList.remove("spinning");
                renderColumn(0, finalBoard[0], []);
            }, 600);

            setTimeout(function () {
                reelElements[1].classList.remove("spinning");
                renderColumn(1, finalBoard[1], []);
            }, 950);

            setTimeout(function () {
                clearInterval(spinTimer);
                reelElements[2].classList.remove("spinning");
                renderColumn(2, finalBoard[2], []);

                isSpinning = false;
                checkWin();
            }, 1300);
        }

        function checkWin() {
            const winRows = [];

            for (let row = 0; row < 3; row++) {
                const sym0 = board[0][row].id;
                const sym1 = board[1][row].id;
                const sym2 = board[2][row].id;

                if (sym0 === sym1 && sym1 === sym2) {
                    winRows.push(row);
                }
            }

            if (winRows.length > 0) {
                isGameOver = true;
                renderAllColumns(board, winRows);
                beaconDome.classList.add("win-flash");
                setStatus("Вітаємо, " + playerName + "! Ви виграли з " + attempt + "-ї спроби!", "win");
            } else if (attempt >= MAX_ATTEMPTS) {
                isGameOver = true;
                setStatus("Спроби закінчились, " + playerName + ". Натисніть «Грати знову»!", "lose");
            } else {
                const left = MAX_ATTEMPTS - attempt;
                setStatus("Немає збігу. Залишилось спроб: " + left + ". Крутіть ще!", "");
            }

            updateUI();
        }

        function resetGame() {
            if (isSpinning) {
                return;
            }
            attempt = 0;
            isGameOver = false;
            beaconDome.classList.remove("win-flash");
            leverTooltip.style.display = "block";

            for (let c = 0; c < 3; c++) {
                reelElements[c].classList.remove("spinning");
            }

            board = [
                getShuffledSymbols().slice(0, 3),
                getShuffledSymbols().slice(0, 3),
                getShuffledSymbols().slice(0, 3)
            ];
            renderAllColumns(board, []);
            updateUI();
            setStatus("Гравець " + playerName + ", потягніть важіль або натисніть «Generate»!", "");
        }

        generateBtn.onclick = function () {
            spinReels();
        };

        leverAssembly.onclick = function () {
            spinReels();
        };

        resetBtn.onclick = function () {
            resetGame();
        };

        editNameBtn.onclick = function (event) {
            
            askPlayerName(playerName);
            resetGame();
        };

        window.onload = function () {
            askPlayerName("User");
            resetGame();
        };
