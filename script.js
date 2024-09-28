const stars = [];
const diaries = JSON.parse(localStorage.getItem('diaries')) || {}; // localStorageから日記データを取得
const starCount = 100;

// 星を描画する関数
function createStar(x, y, name = '', color = '#fff') {
    const star = document.createElement('div');
    star.className = 'star';
    star.style.left = `${x}px`;
    star.style.top = `${y}px`;
    star.style.backgroundColor = color; // 星の色を設定
    star.dataset.name = name; // 星の名前を格納するデータ属性

    // 星の動きに使用するための中心座標と角度を追加
    star.dataset.centerX = x; // 中心のX座標
    star.dataset.centerY = y; // 中心のY座標
    star.dataset.angle = Math.random() * 360; // 角度をランダムに初期化

    // 当たり判定用の要素を追加
    const hitbox = document.createElement('div');
    hitbox.className = 'hitbox';
    hitbox.style.left = `${x}px`;
    hitbox.style.top = `${y}px`;
    hitbox.addEventListener('click', () => handleStarClick(star, x, y, name));

    // 星と当たり判定を画面に追加
    document.getElementById('sky').appendChild(star);
    document.getElementById('sky').appendChild(hitbox);

    // もし日記が存在するなら、色をオレンジにする
    if (diaries[`${x},${y}`]) {
        star.style.backgroundColor = 'orange'; // 日記がついている星をオレンジ色にする
    }
}

// 北斗七星を一定の位置に設定
const hokutoShichiseiPosition = { x: 400, y: 200, name: '北斗七星', color: 'red' };

// 北斗七星を描画（位置を固定）
createStar(hokutoShichiseiPosition.x, hokutoShichiseiPosition.y, hokutoShichiseiPosition.name, hokutoShichiseiPosition.color);

// 星がクリックされたときの処理
function handleStarClick(star, x, y, name) {
    if (name !== '北斗七星') { // 北斗七星の場合、名前を変更できない
        if (!diaries[`${x},${y}`]) {
            const starName = prompt('星の名前を付けてください:');
            if (starName) {
                star.dataset.name = starName; // 星の名前を保存
                const diaryEntry = prompt('日記を入力してください:');
                const currentDate = new Date().toLocaleDateString('ja-JP'); // 現在の日付を取得
                if (diaryEntry) {
                    diaries[`${x},${y}`] = {
                        name: starName,
                        entry: diaryEntry,
                        date: currentDate, // 日付を保存
                    };
                    star.style.backgroundColor = 'orange'; // 星の色を変更
                    saveDiaries(); // 日記データを保存
                }
            }
        } else {
            const existingDiary = diaries[`${x},${y}`];
            alert(`星の名前: ${existingDiary.name}\n日記: ${existingDiary.entry}\n日付: ${existingDiary.date}`); // 日付を表示
            const editEntry = confirm('日記を編集しますか？');
            if (editEntry) {
                const newDiaryEntry = prompt('新しい日記を入力してください:', existingDiary.entry);
                if (newDiaryEntry) {
                    diaries[`${x},${y}`].entry = newDiaryEntry; // 日記を編集
                    saveDiaries(); // 日記データを保存
                }
            }
            const deleteDiary = confirm('日記を削除しますか？');
            if (deleteDiary) {
                delete diaries[`${x},${y}`]; // 日記を削除
                star.style.backgroundColor = '#fff'; // 星の色を元に戻す
                star.dataset.name = ''; // 星の名前をクリア
                saveDiaries(); // 日記データを保存
            }
        }
    } else {
        sparkleStars(); // 北斗七星をクリックしたときに他の星を光らせる
    }
}

// 星を光らせる関数
function sparkleStars() {
    const allStars = document.querySelectorAll('.star:not([data-name="北斗七星"])'); // 北斗七星を除外
    allStars.forEach(star => {
        if (!diaries[`${star.style.left},${star.style.top}`]) { // 日記がついていない白い星をチェック
            star.style.transition = 'background-color 0.3s'; // 光る時のスピードを調整
            star.style.backgroundColor = 'gold'; // 金色に変更
            setTimeout(() => {
                star.style.backgroundColor = '#fff'; // 元の色に戻す
            }, 350); // 350ミリ秒後に戻る
        }
    });
}

// ランダムな位置に星を生成する関数を呼び出す
for (let i = 0; i < starCount; i++) {
    const x = Math.random() * (window.innerWidth - 10);
    const y = Math.random() * (window.innerHeight - 10);
    createStar(x, y);
}

// 日記データを保存する関数
function saveDiaries() {
    localStorage.setItem('diaries', JSON.stringify(diaries)); // localStorageに日記データを保存
}

// 既存の星の日記データを復元する関数
function restoreDiaries() {
    for (const key in diaries) {
        const [x, y] = key.split(',').map(Number);
        createStar(x, y, diaries[key].name); // 星を復元
    }
}

// 各星の移動速度を設定
const starSpeed = 0.01; // 動きをゆっくりにする
const orbitRadius = 50; // 星が移動する円の半径

// アニメーション: 星が円を描くように移動
setInterval(() => {
    const stars = document.querySelectorAll('.star:not([data-name="北斗七星"])'); // 北斗七星を除外
    stars.forEach(star => {
        const centerX = parseFloat(star.dataset.centerX); // 中心のX座標
        const centerY = parseFloat(star.dataset.centerY); // 中心のY座標
        let angle = parseFloat(star.dataset.angle); // 現在の角度

        // 星の新しい座標を計算
        const newX = centerX + orbitRadius * Math.cos(angle);
        const newY = centerY + orbitRadius * Math.sin(angle);

        // 星の位置を更新
        star.style.left = `${newX}px`;
        star.style.top = `${newY}px`;

        // 角度をゆっくり増やす
        angle += starSpeed;
        if (angle >= 2 * Math.PI) {
            angle = 0; // 2πを超えたら角度をリセット
        }
        star.dataset.angle = angle; // 角度を保存
    });
}, 1000 / 60); // 60FPSで更新（滑らかに動くように調整）

// 初回読み込み時に日記データを復元
restoreDiaries();
