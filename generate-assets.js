const sharp = require('sharp');
const path = require('path');
const out = (name) => path.join(__dirname, 'public', name);

async function generate() {
  const chickenSrc = out('toss-logo-light.png');

  // === 가로형 썸네일 1932x828 ===
  const chickenBig = await sharp(chickenSrc).resize(500, 500, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).toBuffer();
  const thumbSvg = Buffer.from(`<svg width="1932" height="828" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#FF6B35"/><stop offset="100%" stop-color="#FF8F35"/></linearGradient></defs>
    <rect width="1932" height="828" fill="url(#bg)"/>
    <text x="140" y="320" font-family="sans-serif" font-weight="800" font-size="88" fill="white">치킨 튀겨서</text>
    <text x="140" y="440" font-family="sans-serif" font-weight="800" font-size="88" fill="white">치킨 받자!</text>
    <text x="140" y="530" font-family="sans-serif" font-weight="500" font-size="36" fill="rgba(255,255,255,0.85)">좋아하는 브랜드 치킨을 골라 직접 튀겨보세요</text>
    <text x="140" y="590" font-family="sans-serif" font-weight="500" font-size="36" fill="rgba(255,255,255,0.85)">앱을 닫아도 치킨은 계속 튀겨집니다</text>
  </svg>`);
  await sharp(thumbSvg).composite([{ input: chickenBig, top: 164, left: 1300 }]).png().toFile(out('toss-thumbnail.png'));
  console.log('Thumbnail 1932x828 done!');

  // === 세로형 스크린샷 1: 브랜드 선택 ===
  const ss1 = Buffer.from(`<svg width="636" height="1048" xmlns="http://www.w3.org/2000/svg">
    <rect width="636" height="1048" fill="#FFF8F0"/>
    <rect x="0" y="0" width="636" height="200" fill="#FF6B35"/>
    <text x="318" y="80" font-family="sans-serif" font-weight="800" font-size="48" fill="white" text-anchor="middle">치킨준닭</text>
    <text x="318" y="130" font-family="sans-serif" font-weight="500" font-size="24" fill="rgba(255,255,255,0.9)" text-anchor="middle">먹고 싶은 닭을 튀겨보세요</text>
    <text x="318" y="170" font-family="sans-serif" font-weight="500" font-size="20" fill="rgba(255,255,255,0.7)" text-anchor="middle">18개 브랜드 치킨 중 하나를 골라요</text>
    ${[
      ['삐삐큐','황끔올리뷔','#8B4513'], ['삐에이취씨','뿌릉클','#E31837'],
      ['꾜촌','허늬콤보','#C8102E'], ['꿉네','고츄바사사삭','#FF4500'],
      ['녜녜','오린엔탈파닭','#9370DB'], ['펠리카냐','양념치킨','#FF8C00'],
      ['뿌라닭','블랙알리오','#2F4F4F'], ['홓시기','매운간장치킨','#228B22'],
    ].map(([name,menu,color], i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const x = 40 + col * 296;
      const y = 240 + row * 100;
      return `<rect x="${x}" y="${y}" width="260" height="80" rx="14" fill="white" stroke="${i===0?color:'#e5e7eb'}" stroke-width="${i===0?'2':'1'}"/>
        <text x="${x+130}" y="${y+35}" font-family="sans-serif" font-weight="700" font-size="20" fill="#191f28" text-anchor="middle">${name}</text>
        <text x="${x+130}" y="${y+60}" font-family="sans-serif" font-weight="500" font-size="14" fill="#8b95a1" text-anchor="middle">${menu}</text>`;
    }).join('')}
    <rect x="40" y="920" width="556" height="70" rx="14" fill="#FF6B35"/>
    <text x="318" y="965" font-family="sans-serif" font-weight="700" font-size="26" fill="white" text-anchor="middle">삐삐큐 튀기기 시작!</text>
  </svg>`);
  await sharp(ss1).png().toFile(out('toss-ss1.png'));
  console.log('SS1 done!');

  // === 세로형 스크린샷 2: 메인 게임 ===
  const ss2 = Buffer.from(`<svg width="636" height="1048" xmlns="http://www.w3.org/2000/svg">
    <rect width="636" height="1048" fill="#fafafa"/>
    <text x="318" y="50" font-family="sans-serif" font-weight="500" font-size="18" fill="#8b95a1" text-anchor="middle">오늘의 치킨 평균 시세</text>
    <text x="318" y="90" font-family="sans-serif" font-weight="800" font-size="36" fill="#191f28" text-anchor="middle">21,694원</text>
    <rect x="168" y="115" width="300" height="65" rx="16" fill="white" stroke="#e5e7eb"/>
    <text x="318" y="143" font-family="sans-serif" font-weight="700" font-size="16" fill="#191f28" text-anchor="middle">먹고 싶은 닭을 튀겨보세요 🍗</text>
    <rect x="228" y="152" width="130" height="22" rx="8" fill="#8B4513"/>
    <text x="293" y="168" font-family="sans-serif" font-weight="800" font-size="12" fill="white" text-anchor="middle">삐삐큐 황끔올리뷔</text>
    <rect x="30" y="200" width="576" height="440" rx="20" fill="white" stroke="#e5e7eb"/>
    <text x="60" y="240" font-family="sans-serif" font-weight="700" font-size="15" fill="#FF6B35">튀김통 최대 용량</text>
    <text x="60" y="270" font-family="sans-serif" font-weight="800" font-size="28" fill="#191f28">0.5g</text>
    <text x="576" y="240" font-family="sans-serif" font-weight="700" font-size="15" fill="#8b95a1" text-anchor="end">튀기는 속도</text>
    <text x="576" y="270" font-family="sans-serif" font-weight="800" font-size="28" fill="#191f28" text-anchor="end">10.8g/hr</text>
    <rect x="50" y="290" width="536" height="8" rx="4" fill="#f0f0f0"/>
    <rect x="50" y="290" width="350" height="8" rx="4" fill="#8B4513"/>
    <circle cx="318" cy="430" r="90" fill="#FDEBD0"/>
    <text x="318" y="448" font-family="sans-serif" font-size="70" text-anchor="middle">🍗</text>
    <text x="318" y="580" font-family="sans-serif" font-weight="600" font-size="15" fill="#8b95a1" text-anchor="middle">치킨을 눌러서 튀겨 보아요 (7번 남음)</text>
    <text x="318" y="660" font-family="sans-serif" font-weight="700" font-size="14" fill="#4e5968" text-anchor="middle">지금까지 튀겨진 BBQ 황금올리브</text>
    <rect x="80" y="680" width="476" height="45" rx="12" fill="#1a1a1a"/>
    <text x="318" y="710" font-family="monospace" font-weight="800" font-size="24" fill="#FF6B35" text-anchor="middle">0.00032784g</text>
    <rect x="30" y="750" width="276" height="52" rx="14" fill="#8B4513"/>
    <text x="168" y="783" font-family="sans-serif" font-weight="700" font-size="17" fill="white" text-anchor="middle">📦 포장하기</text>
    <rect x="330" y="750" width="276" height="52" rx="14" fill="white" stroke="#e5e7eb" stroke-width="2"/>
    <text x="468" y="783" font-family="sans-serif" font-weight="700" font-size="17" fill="#FF6B35" text-anchor="middle">⚡ 빠르게 튀기기</text>
    <rect x="30" y="830" width="576" height="65" rx="14" fill="white" stroke="#e5e7eb"/>
    <text x="60" y="870" font-family="sans-serif" font-size="28">📦</text>
    <text x="100" y="860" font-family="sans-serif" font-weight="800" font-size="16" fill="#191f28">치킨 0.00마리 포장했어요</text>
    <text x="100" y="882" font-family="sans-serif" font-weight="500" font-size="12" fill="#8b95a1">0.0g 모음 · 1,000g이면 한마리 완성</text>
  </svg>`);
  await sharp(ss2).png().toFile(out('toss-ss2.png'));
  console.log('SS2 done!');

  // === 세로형 스크린샷 3: 랭킹 + 포인트 + 가이드 ===
  const ss3 = Buffer.from(`<svg width="636" height="1048" xmlns="http://www.w3.org/2000/svg">
    <rect width="636" height="1048" fill="#fafafa"/>
    <rect x="30" y="30" width="576" height="200" rx="20" fill="white" stroke="#e5e7eb"/>
    <text x="60" y="70" font-family="sans-serif" font-weight="800" font-size="20" fill="#191f28">🔥 실시간 인기 치킨</text>
    <rect x="460" y="48" width="50" height="24" rx="6" fill="#FFF3E0"/>
    <text x="485" y="66" font-family="sans-serif" font-weight="700" font-size="12" fill="#E65100" text-anchor="middle">LIVE</text>
    ${[['1위','삐삐큐','18%','#FF6B35'],['2위','삐에이취씨','15%','#666'],['3위','꾜촌','14%','#666']].map(([rank,name,pct,color],i) => {
      const x = 50 + i * 183;
      return `<rect x="${x}" y="100" width="170" height="110" rx="12" fill="${i===0?'#FFF8F0':'#fafafa'}"/>
        <text x="${x+85}" y="130" font-family="sans-serif" font-weight="800" font-size="16" fill="${color}" text-anchor="middle">${rank}</text>
        <text x="${x+85}" y="160" font-family="sans-serif" font-weight="700" font-size="18" fill="#191f28" text-anchor="middle">${name}</text>
        <text x="${x+85}" y="185" font-family="sans-serif" font-weight="500" font-size="14" fill="#8b95a1" text-anchor="middle">${pct}</text>`;
    }).join('')}
    <rect x="30" y="260" width="576" height="260" rx="20" fill="white" stroke="#e5e7eb"/>
    <text x="60" y="300" font-family="sans-serif" font-weight="800" font-size="22" fill="#191f28">💰 토스포인트 전환</text>
    <text x="60" y="335" font-family="sans-serif" font-weight="500" font-size="15" fill="#8b95a1">치킨을 모아서 토스포인트로 바꿔요</text>
    <rect x="50" y="360" width="536" height="55" rx="12" fill="#f8f8f8"/>
    <text x="80" y="395" font-family="sans-serif" font-weight="600" font-size="16" fill="#4e5968">포장할 때마다</text>
    <text x="556" y="395" font-family="sans-serif" font-weight="800" font-size="18" fill="#FF6B35" text-anchor="end">+5P</text>
    <rect x="50" y="430" width="536" height="55" rx="12" fill="#f8f8f8"/>
    <text x="80" y="465" font-family="sans-serif" font-weight="600" font-size="16" fill="#4e5968">광고 보고 탭 충전</text>
    <text x="556" y="465" font-family="sans-serif" font-weight="800" font-size="18" fill="#FF6B35" text-anchor="end">+3P</text>
    <rect x="30" y="550" width="576" height="220" rx="20" fill="white" stroke="#e5e7eb"/>
    <text x="60" y="590" font-family="sans-serif" font-weight="800" font-size="22" fill="#191f28">📋 이렇게 즐겨요</text>
    <text x="60" y="640" font-family="sans-serif" font-weight="700" font-size="16" fill="#FF6B35">STEP 1</text>
    <text x="150" y="640" font-family="sans-serif" font-weight="600" font-size="16" fill="#191f28">좋아하는 브랜드 치킨을 골라요</text>
    <text x="60" y="680" font-family="sans-serif" font-weight="700" font-size="16" fill="#FF6B35">STEP 2</text>
    <text x="150" y="680" font-family="sans-serif" font-weight="600" font-size="16" fill="#191f28">치킨을 눌러서 더 빠르게 튀겨요</text>
    <text x="60" y="720" font-family="sans-serif" font-weight="700" font-size="16" fill="#FF6B35">STEP 3</text>
    <text x="150" y="720" font-family="sans-serif" font-weight="600" font-size="16" fill="#191f28">1,000g 모으면 한마리 완성!</text>
    <rect x="30" y="800" width="576" height="120" rx="20" fill="#FF6B35"/>
    <text x="318" y="852" font-family="sans-serif" font-weight="800" font-size="28" fill="white" text-anchor="middle">앱을 닫아도</text>
    <text x="318" y="895" font-family="sans-serif" font-weight="800" font-size="28" fill="white" text-anchor="middle">치킨은 계속 튀겨집니다 🍗</text>
  </svg>`);
  await sharp(ss3).png().toFile(out('toss-ss3.png'));
  console.log('SS3 done!');
}

generate().catch(e => console.error(e));
