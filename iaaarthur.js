/* MEU ALIMENTO — TEACHABLE MACHINE
   1. Publique seu modelo no Teachable Machine.
   2. Copie o endereço que termina com /models/XXXXX/
   3. Cole abaixo.
*/
const MODEL_URL = "https://teachablemachine.withgoogle.com/models/SEU_MODELO_AQUI/";

/* A chave de cada item precisa ser EXATAMENTE igual ao nome da classe do Teachable Machine.
   Os dados abaixo são exemplos de estrutura. Substitua pelos dados reais conferidos nos rótulos.
*/
const PRODUTOS = {
  "Zolpidem": {
    nome: "Zolpidem",
    imagem: "assets/img/produtos/nao-cadastrado.svg",
    utilidade: "-Ajuda pessoas que têm dificuldade para adormecer ou manter o sono. -É receitado para uso breve, geralmente por um período máximo de duas a quatro semanas. ",
    descricao: "O zolpidem é um medicamento hipnótico indicado para o tratamento de curto prazo da insônia ocasional, transitória ou crônica.",
    efeito colateral: "-Efeitos colaterais:Pode causar sonambulismo, amnésia temporária e comportamentos sob o efeito do remédio sem que a pessoa se lembre no dia seguinte (como comer ou enviar mensagens). -Dependência: O uso prolongado ou em doses maiores do que o recomendado pode gerar tolerância e dependência física ou psicológica. -Controle: No Brasil, a venda exige receita médica controlada (receita de cor azul) devido aos riscos associados ao uso inadequado.",
  },
  "Dipirona": {
    nome: "Dipirona",
    imagem: "assets/img/produtos/nao-cadastrado.svg",
    utilidade: "-Alívio da dor: Indicada para dores de intensidade leve a moderada, como dor de cabeça, dor muscular, dor de dente e cólicas. -Controle da febre: Usada para reduzir a temperatura corporal elevada em quadros infecciosos ou gripais.",
    descricao: "A dipirona (também conhecida como metamizol) é um dos medicamentos analgésicos e antipiréticos (contra a dor e a febre) mais amplamente utilizados no Brasil.",
    efeito colateral: "-Pressão baixa: Pode causar queda de pressão, especialmente na versão injetável. -Alergias: É contra indicada para pessoas com histórico de alergia à dipirona ou a outras pirazolonas. -Uso excessivo: Tomar analgésicos simples com muita frequência (mais de três vezes por semana) pode provocar dor de cabeça por efeito rebote.",
  },
  "Paracetamol": {
    nome: "Paracetamol",
    imagem: "assets/img/produtos/nao-cadastrado.svg",
    utilidade: "-Alívio da dor: Indicado para dor de cabeça, dor muscular, dor de dente, cólicas menstruais e dores associadas a gripes ou resfriados. -Controle da febre: Atua no sistema nervoso central para baixar a temperatura corporal.",
    descricao: "O paracetamol (também conhecido como acetaminofeno) é um dos medicamentos mais utilizados no mundo para o alívio temporário de dores leves a moderadas e redução da febre.",
    efeito colateral: "-Dose máxima: O uso excessivo pode causar lesões graves no fígado. Adultos geralmente não devem ultrapassar a dose máxima diária recomendada (comumente de 4 gramas). -Orientação médica: Consulte sempre a bula ou um profissional de saúde para saber a dosagem correta conforme o peso e a idade",
  },
  "Caverdilol": {
    nome: "Caverdilol",
    imagem: "assets/img/produtos/nao-cadastrado.svg",
    utilidade: "-Hipertensão arterial: Reduz a pressão alta, isoladamente ou junto com outros remédios. -Insuficiência cardíaca: Melhora a função do coração e protege contra o desgaste contínuo. -Angina do peito: Alivia a dor no peito causada por falta de sangue no coração.",
    descricao: "O carvedilol é um medicamento betabloqueador com ação vasodilatadora, usado principalmente para tratar a pressão alta, a insuficiência cardíaca e a angina (dor no peito).",
    efeito colateral: "-Tontura e queda de pressão ao levantar rápido (hipotensão ortostática). -Batimento cardíaco muito lento (bradicardia). -Cansaço físico ou fadiga. -Dificuldade respiratória em pessoas com asma ou problemas pulmonares.",
  },
  "Bromoprida": {
    nome: "Bromoprida",
    imagem: "assets/img/produtos/nao-cadastrado.svg",
    utilidade: "-Náuseas e vômitos: Alivia enjoos causados por cirurgias, infecções, problemas metabólicos ou uso de outros remédios. -Distúrbios motores: Melhora o trânsito do estômago e do intestino, ajudando em casos de má digestão ou empachamento.Refluxo: Reduz o retorno do conteúdo ácido do estômago para o esôfago. -Exames: Facilita o esvaziamento gástrico antes de exames como endoscopia ou procedimentos radiológicos.",
    descricao: "O carvedilol é um medicamento betabloqueador com ação vasodilatadora, usado principalmente para tratar a pressão alta, a insuficiência cardíaca e a angina (dor no peito).",
    efeito colateral: "-Venda sob prescrição: Exige receita médica para a compra. -Efeito mais comum: Pode causar sonolência. Evite dirigir ou operar máquinas se sentir esse sintoma. -Restrições: Não é indicado para prisão de ventre e não deve ser usado sem avaliação médica para descobrir a causa dos sintomas.",
  },
};

const MIN_CONFIDENCE=.85, STABLE_FRAMES=7;
let model=null,stream=null,animationId=null,lastCandidate="",stableCount=0,running=false;
const $=id=>document.getElementById(id);
const els={video:$("camera"),placeholder:$("cameraPlaceholder"),startBtn:$("startBtn"),stopBtn:$("stopBtn"),cameraStatus:$("cameraStatus"),modelStatus:$("modelStatus"),confidenceText:$("confidenceText"),confidenceBar:$("confidenceBar"),detectedLabel:$("detectedLabel"),resultCard:$("resultCard"),resultStatus:$("resultStatus"),productName:$("productName"),productDescription:$("productDescription"),productImage:$("productImage"),gluten:$("gluten"),lactose:$("lactose"),calorias:$("calorias"),acucares:$("acucares"),sodio:$("sodio"),gordura:$("gordura"),alergenos:$("alergenos"),contraindicacao:$("contraindicacao"),alternativa:$("alternativa"),comparacao:$("comparacao"),fonte:$("fonte"),scientificNote:$("scientificNote"),liveDot:document.querySelector('.live-dot'),scanSweep:document.querySelector('.scan-sweep')};
function configured(){return MODEL_URL.startsWith('https://')&&!MODEL_URL.includes('SEU_MODELO_AQUI')}
async function loadModel(){if(!configured())throw new Error('Cole o link do seu modelo no início de assets/js/ia.js.');els.modelStatus.textContent='Carregando modelo...';model=await tmImage.load(MODEL_URL+'model.json',MODEL_URL+'metadata.json');els.modelStatus.textContent='Modelo carregado'}
async function startCamera(){try{els.startBtn.disabled=true;els.startBtn.textContent='Preparando...';if(!model)await loadModel();stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:'environment'},width:{ideal:1280},height:{ideal:720}},audio:false});els.video.srcObject=stream;await els.video.play();running=true;els.video.style.display='block';els.placeholder.style.display='none';els.startBtn.classList.add('hidden');els.stopBtn.classList.remove('hidden');els.cameraStatus.textContent='Câmera ativa';els.liveDot.classList.add('on');els.scanSweep.classList.add('on');predictLoop()}catch(e){console.error(e);els.startBtn.disabled=false;els.startBtn.textContent='Tentar novamente';els.cameraStatus.textContent='Verifique a configuração';els.modelStatus.textContent='Não iniciado';showMessage(e.message)}}
async function predictLoop(){if(!running||!model)return;const predictions=await model.predict(els.video,false);const best=predictions.reduce((a,b)=>a.probability>b.probability?a:b);const c=Math.round(best.probability*100);els.confidenceText.textContent=c+'%';els.confidenceBar.style.width=c+'%';els.detectedLabel.textContent='Mais provável: '+best.className;if(best.probability>=MIN_CONFIDENCE){if(lastCandidate===best.className)stableCount++;else{lastCandidate=best.className;stableCount=1}if(stableCount>=STABLE_FRAMES)showProduct(best.className)}else{lastCandidate='';stableCount=0}animationId=requestAnimationFrame(predictLoop)}
function setData(p){els.productName.textContent=p.nome;els.productDescription.textContent=p.descricao;els.productImage.src=p.imagem||'assets/img/produtos/nao-cadastrado.svg';els.productImage.alt='Imagem de '+p.nome;els.gluten.textContent=p.gluten||'Não cadastrado';els.lactose.textContent=p.lactose||'Não cadastrado';els.calorias.textContent=p.calorias||'Não cadastrado';els.acucares.textContent=p.acucares||'Não cadastrado';els.sodio.textContent=p.sodio||'Não cadastrado';els.gordura.textContent=p.gordura||'Não cadastrado';els.alergenos.textContent=p.alergenos||'Não cadastrado';els.contraindicacao.textContent=p.contraindicacao||'Consulte o rótulo.';els.alternativa.textContent=p.alternativa||'Nenhuma alternativa cadastrada';els.comparacao.textContent=p.comparacao||'';els.fonte.textContent=p.fonte||'Rótulo do produto';els.scientificNote.textContent=p.nota||'Confira sempre a embalagem física.'}
function showProduct(name){const p=PRODUTOS[name];if(!p)return showUnknown(name);els.resultCard.className='product-result recognized';els.resultStatus.className='status-pill recognized';els.resultStatus.textContent='Produto reconhecido';setData(p)}
function showUnknown(name){els.resultCard.className='product-result unknown';els.resultStatus.className='status-pill unknown';els.resultStatus.textContent='Produto não cadastrado';setData({nome:name||'Produto não cadastrado',descricao:'A IA reconheceu esta classe, mas não há informações associadas a ela no cadastro PRODUTOS.',imagem:'assets/img/produtos/nao-cadastrado.svg',contraindicacao:'Sem dados cadastrados. Consulte o rótulo físico.',nota:'Não interprete ausência de cadastro como ausência de glúten, lactose, alérgenos ou qualquer outro componente.'})}
function showMessage(msg){els.resultCard.className='product-result unknown';els.resultStatus.className='status-pill unknown';els.resultStatus.textContent='Configuração necessária';els.productName.textContent='A câmera/IA ainda não iniciou';els.productDescription.textContent=msg}
function stopCamera(){running=false;if(animationId)cancelAnimationFrame(animationId);if(stream)stream.getTracks().forEach(t=>t.stop());els.video.srcObject=null;els.video.style.display='none';els.placeholder.style.display='flex';els.startBtn.classList.remove('hidden');els.stopBtn.classList.add('hidden');els.startBtn.disabled=false;els.startBtn.textContent='Iniciar câmera e IA';els.cameraStatus.textContent='Câmera desligada';els.liveDot.classList.remove('on');els.scanSweep.classList.remove('on');els.confidenceText.textContent='0%';els.confidenceBar.style.width='0%';els.detectedLabel.textContent='Nenhum produto identificado.';lastCandidate='';stableCount=0}
els.startBtn.addEventListener('click',startCamera);els.stopBtn.addEventListener('click',stopCamera);if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia){showMessage('Este navegador não oferece acesso à câmera. Publique o site em HTTPS e use um navegador moderno.');els.startBtn.disabled=true}
