const fs = require('fs');
let code = fs.readFileSync('src/components/auth/Login.tsx', 'utf8');

if (!code.includes('const isNextDisabled')) {
  const isNextDisabledFunc = `
  const isNextDisabled = () => {
    switch(step) {
      case 2: return !gender;
      case 3: return !goal;
      case 4: return targetAreas.length === 0;
      case 5: return !dob;
      case 6: return !height;
      case 7: return !weight;
      case 8: return !targetWeight;
      case 9: return !environment;
      case 10: return exerciseTypes.length === 0;
      case 11: return !workoutLevel;
      case 12: return physicalIssues.length === 0;
      case 13: return !activityLevel;
      case 14: return !frequency || loading;
      default: return false;
    }
  };

`;
  code = code.replace('const handleNext = async () => {', isNextDisabledFunc + '  const handleNext = async () => {');
}

code = code.replace(/<div>\s*<button[^>]*onClick=\{handleNext\}[^>]*>[\s\S]*?次へ[\s\S]*?<\/button>\s*<\/div>/g, '');
code = code.replace(/<div>\s*<button[^>]*onClick=\{handleCalculateAI\}[^>]*>[\s\S]*?AIで目標を計算して完了[\s\S]*?<\/button>\s*<\/div>/g, '');

code = code.replace(/padding: '10px 20px 20px'/g, "padding: '10px 20px 100px'");
code = code.replace(/padding: 0, margin: 0 \}\}/g, "padding: 0, margin: 0, lineHeight: '1.2', paddingBottom: '4px' }}");

if (!code.includes('Sticky Wizard Footer')) {
  const footerCode = `
      {/* Sticky Wizard Footer */}
      {step >= 2 && step <= 14 && (
        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, padding: '15px 20px', background: isDark ? 'rgba(15,15,17,0.95)' : 'rgba(255,255,255,0.95)', borderTop: \`1px solid \${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}\`, zIndex: 100, display: 'flex', gap: '10px', backdropFilter: 'blur(10px)', paddingBottom: 'calc(15px + env(safe-area-inset-bottom))' }}>
          <button type="button" onClick={() => setStep(step - 1)} style={{ padding: '14px', width: '100px', background: 'transparent', border: '1px solid #DCA038', color: '#DCA038', borderRadius: '30px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            戻る
          </button>
          <button type="button" onClick={step === 14 ? handleCalculateAI : handleNext} disabled={isNextDisabled()} style={{ flex: 1, padding: '14px', background: !isNextDisabled() ? 'linear-gradient(180deg, #FDF0A6 0%, #DCA038 45%, #9C6615 55%, #E8C162 100%)' : 'rgba(255, 255, 255, 0.1)', boxShadow: !isNextDisabled() ? '0 4px 15px rgba(0,0,0,0.5)' : 'none', color: !isNextDisabled() ? '#000' : 'rgba(255, 255, 255, 0.3)', letterSpacing: !isNextDisabled() ? '0.1em' : 'normal', borderRadius: '30px', fontSize: '1.1rem', fontWeight: 'bold', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
            {step === 14 ? (
              <>
                {loading ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-robot"></i>}
                <span style={{ marginLeft: '8px' }}>{loading ? 'AIで目標を計算中...' : 'AIで目標を計算して完了'}</span>
              </>
            ) : '次へ'}
          </button>
        </div>
      )}
    </div>
  );
}
`;
  code = code.substring(0, code.lastIndexOf('    </div>')) + footerCode;
}

fs.writeFileSync('src/components/auth/Login.tsx', code);
