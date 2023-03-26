// モーダル要素を取得
const modal = document.getElementById('myModal')

// OKボタン要素を取得
const okButton = document.querySelector('.ok-button')

// 閉じるボタン要素を取得
const closeButton = document.querySelector('.close')

// ページ読み込み時にモーダルを表示
window.onload = function () {
  modal.style.display = 'block'
}

// OKボタンがクリックされたときの処理
okButton.onclick = function () {
  modal.style.display = 'none'
}

// 閉じるボタンがクリックされたときの処理
closeButton.onclick = function () {
  modal.style.display = 'none'
}
