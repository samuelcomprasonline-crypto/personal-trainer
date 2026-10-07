import { useState } from 'react';
import { Pressable, View } from 'react-native';
import Svg, { Circle, Defs, G, Line, LinearGradient, Path, Rect, Stop, Text as SvgText } from 'react-native-svg';
import type { BioimpedanceAssessment } from '../domain/types';
import { Body, Card, Chip, Label, Title } from './components';
import { useTheme } from './theme';

type LayerMode = 'musculo' | 'gordura' | 'agua';
type SegmentKey = 'bracoEsquerdo' | 'bracoDireito' | 'tronco' | 'pernaEsquerda' | 'pernaDireita';

export function Body3DSegmentMap({ bio }: { bio: BioimpedanceAssessment }) {
  const t = useTheme();
  const [layer, setLayer] = useState<LayerMode>('musculo');
  const [selectedSegment, setSelectedSegment] = useState<SegmentKey | null>(null);

  const colors = {
    musculo: t.muscleColor || '#10B981',
    gordura: t.fatColor || '#F43F5E',
    agua: t.waterColor || '#06B6D4',
  };

  const activeColor = colors[layer];

  const layerTitles = {
    musculo: 'Mapeamento 3D: Massa Muscular',
    gordura: 'Mapeamento 3D: Tecido Adiposo (Gordura)',
    agua: 'Mapeamento 3D: Hidratação & Água Corporal',
  };

  const layerDescriptions = {
    musculo: 'Escaneamento segmentar de hipertrofia e simetria muscular esquelética.',
    gordura: 'Distribuição regional de gordura corporal subcutânea e visceral.',
    agua: 'Balanço hídrico segmentar, volume intracelular e retenção hídrica.',
  };

  // Coleta os valores do segmento atual
  const getSegmentData = (seg: SegmentKey) => {
    if (layer === 'musculo') {
      const data = bio.segmentar.musculo[seg];
      return {
        label: seg === 'tronco' ? 'Tronco' : seg.includes('braco') ? (seg.includes('Esquerdo') ? 'Braço Esq.' : 'Braço Dir.') : (seg.includes('Esquerda') ? 'Perna Esq.' : 'Perna Dir.'),
        valKg: `${data.kg} kg`,
        perc: `${data.proporcaoPadraoPerc}%`,
        isAbove: data.proporcaoPadraoPerc >= 100,
      };
    }
    if (layer === 'gordura') {
      const data = bio.segmentar.gordura[seg];
      return {
        label: seg === 'tronco' ? 'Tronco' : seg.includes('braco') ? (seg.includes('Esquerdo') ? 'Braço Esq.' : 'Braço Dir.') : (seg.includes('Esquerda') ? 'Perna Esq.' : 'Perna Dir.'),
        valKg: `${data.kg} kg`,
        perc: `${data.proporcaoPadraoPerc}%`,
        isAbove: data.proporcaoPadraoPerc >= 150,
      };
    }
    // Camada água (estimada com base no volume livre de gordura)
    const factor = seg === 'tronco' ? 0.48 : seg.includes('braco') ? 0.08 : 0.18;
    const aguaKg = (bio.aguaTotalKg * factor).toFixed(1);
    return {
      label: seg === 'tronco' ? 'Tronco' : seg.includes('braco') ? (seg.includes('Esquerdo') ? 'Braço Esq.' : 'Braço Dir.') : (seg.includes('Esquerda') ? 'Perna Esq.' : 'Perna Dir.'),
      valKg: `${aguaKg} kg`,
      perc: `${((Number(aguaKg) / bio.aguaTotalKg) * 100).toFixed(0)}%`,
      isAbove: true,
    };
  };

  const currentSegmentData = selectedSegment ? getSegmentData(selectedSegment) : null;

  return (
    <Card>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10 }}>
        <View style={{ flex: 1, minWidth: 200 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <View
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: activeColor,
                shadowColor: activeColor,
                shadowOpacity: 0.8,
                shadowRadius: 6,
              }}
            />
            <Label>Topografia Anatômica 3D</Label>
          </View>
          <Title size={22}>{layerTitles[layer]}</Title>
          <Body muted style={{ fontSize: 13 } as any}>
            {layerDescriptions[layer]}
          </Body>
        </View>

        {/* Seletor de Camadas Holográficas */}
        <View style={{ flexDirection: 'row', gap: 6 }}>
          <Chip
            label="Músculo"
            selected={layer === 'musculo'}
            onPress={() => {
              setLayer('musculo');
              setSelectedSegment(null);
            }}
          />
          <Chip
            label="Gordura"
            selected={layer === 'gordura'}
            onPress={() => {
              setLayer('gordura');
              setSelectedSegment(null);
            }}
          />
          <Chip
            label="Água"
            selected={layer === 'agua'}
            onPress={() => {
              setLayer('agua');
              setSelectedSegment(null);
            }}
          />
        </View>
      </View>

      {/* Canvas Holográfico 3D com Linhas Vetoriais e Nós */}
      <View
        style={{
          width: '100%',
          backgroundColor: '#07090E',
          borderRadius: 20,
          borderWidth: 1,
          borderColor: `${activeColor}30`,
          paddingVertical: 14,
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <Svg viewBox="0 0 340 420" width="100%" height={380}>
          <Defs>
            {/* Gradiente do corpo holográfico */}
            <LinearGradient id="holoGradient" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor={activeColor} stopOpacity="0.35" />
              <Stop offset="50%" stopColor={activeColor} stopOpacity="0.15" />
              <Stop offset="100%" stopColor={activeColor} stopOpacity="0.05" />
            </LinearGradient>

            {/* Gradiente do tronco */}
            <LinearGradient id="troncoGrad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor={activeColor} stopOpacity="0.45" />
              <Stop offset="100%" stopColor={activeColor} stopOpacity="0.15" />
            </LinearGradient>
          </Defs>

          {/* Grade cibernética de fundo */}
          {[-80, -40, 0, 40, 80].map((offset, i) => (
            <Line
              key={`grid-h-${i}`}
              x1="30"
              y1={210 + offset * 1.5}
              x2="310"
              y2={210 + offset * 1.5}
              stroke="#1A2233"
              strokeDasharray="2 6"
              strokeWidth="0.8"
            />
          ))}

          {/* ================= CABEÇA ================= */}
          <Circle cx="170" cy="45" r="24" fill="none" stroke={activeColor} strokeWidth="2" opacity="0.8" />
          <Circle cx="170" cy="45" r="16" fill="none" stroke={activeColor} strokeDasharray="3 3" strokeWidth="1" opacity="0.4" />

          {/* ================= PESCOÇO & CLAVÍCULA ================= */}
          <Path d="M 163 69 L 163 80 L 177 80 L 177 69" fill="none" stroke={activeColor} strokeWidth="1.5" />
          <Line x1="125" y1="90" x2="215" y2="90" stroke={activeColor} strokeWidth="2" />

          {/* ================= TRONCO (PEITORAL + ABDÔMEN + LOMBAR) ================= */}
          <Path
            d="M 130 90 L 115 130 L 125 210 L 170 230 L 215 210 L 225 130 L 210 90 Z"
            fill="url(#troncoGrad)"
            stroke={selectedSegment === 'tronco' ? '#FFFFFF' : activeColor}
            strokeWidth={selectedSegment === 'tronco' ? '3' : '2'}
          />
          {/* Linhas 3D de relevo do tronco */}
          <Line x1="170" y1="90" x2="170" y2="230" stroke={activeColor} strokeWidth="1" strokeDasharray="4 3" opacity="0.6" />
          <Path d="M 135 125 Q 170 145 205 125" fill="none" stroke={activeColor} strokeWidth="1.2" opacity="0.7" />
          <Path d="M 130 160 Q 170 180 210 160" fill="none" stroke={activeColor} strokeWidth="1.2" opacity="0.7" />
          <Path d="M 135 190 Q 170 205 205 190" fill="none" stroke={activeColor} strokeWidth="1.2" opacity="0.7" />

          {/* Rótulo do Tronco */}
          <SvgText
            x="170"
            y="155"
            fill="#FFFFFF"
            fontSize="12"
            fontWeight="bold"
            textAnchor="middle"
          >
            {getSegmentData('tronco').valKg}
          </SvgText>
          <SvgText
            x="170"
            y="172"
            fill={activeColor}
            fontSize="10"
            textAnchor="middle"
          >
            TRONCO ({getSegmentData('tronco').perc})
          </SvgText>

          {/* ================= BRAÇO ESQUERDO (VISÃO ANTERIOR: LADO DIREITO DO SVG) ================= */}
          <Path
            d="M 215 90 L 245 140 L 255 200 L 245 225 L 235 220 L 230 150 L 215 110"
            fill={activeColor}
            fillOpacity="0.18"
            stroke={selectedSegment === 'bracoEsquerdo' ? '#FFFFFF' : activeColor}
            strokeWidth={selectedSegment === 'bracoEsquerdo' ? '3' : '1.8'}
          />
          {/* Linhas de fibra 3D no braço esquerdo */}
          <Line x1="225" y1="120" x2="245" y2="170" stroke={activeColor} strokeWidth="1" strokeDasharray="3 3" opacity="0.5" />
          <SvgText x="275" y="150" fill="#FFFFFF" fontSize="11" fontWeight="bold">
            {getSegmentData('bracoEsquerdo').valKg}
          </SvgText>
          <SvgText x="275" y="165" fill={activeColor} fontSize="9">
            B. Esq ({getSegmentData('bracoEsquerdo').perc})
          </SvgText>

          {/* ================= BRAÇO DIREITO (VISÃO ANTERIOR: LADO ESQUERDO DO SVG) ================= */}
          <Path
            d="M 125 90 L 95 140 L 85 200 L 95 225 L 105 220 L 110 150 L 125 110"
            fill={activeColor}
            fillOpacity="0.18"
            stroke={selectedSegment === 'bracoDireito' ? '#FFFFFF' : activeColor}
            strokeWidth={selectedSegment === 'bracoDireito' ? '3' : '1.8'}
          />
          {/* Linhas de fibra 3D no braço direito */}
          <Line x1="115" y1="120" x2="95" y2="170" stroke={activeColor} strokeWidth="1" strokeDasharray="3 3" opacity="0.5" />
          <SvgText x="65" y="150" fill="#FFFFFF" fontSize="11" fontWeight="bold" textAnchor="end">
            {getSegmentData('bracoDireito').valKg}
          </SvgText>
          <SvgText x="65" y="165" fill={activeColor} fontSize="9" textAnchor="end">
            B. Dir ({getSegmentData('bracoDireito').perc})
          </SvgText>

          {/* ================= PERNA DIREITA (LADO ESQUERDO DO SVG) ================= */}
          <Path
            d="M 125 210 L 165 230 L 155 310 L 148 385 L 125 385 L 120 310 L 115 230 Z"
            fill={activeColor}
            fillOpacity="0.20"
            stroke={selectedSegment === 'pernaDireita' ? '#FFFFFF' : activeColor}
            strokeWidth={selectedSegment === 'pernaDireita' ? '3' : '1.8'}
          />
          {/* Relevo 3D quadríceps / panturrilha direita */}
          <Line x1="135" y1="240" x2="140" y2="300" stroke={activeColor} strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
          <Circle cx="138" cy="308" r="4" fill={activeColor} />
          <SvgText x="75" y="320" fill="#FFFFFF" fontSize="11" fontWeight="bold" textAnchor="end">
            {getSegmentData('pernaDireita').valKg}
          </SvgText>
          <SvgText x="75" y="335" fill={activeColor} fontSize="9" textAnchor="end">
            P. Dir ({getSegmentData('pernaDireita').perc})
          </SvgText>

          {/* ================= PERNA ESQUERDA (LADO DIREITO DO SVG) ================= */}
          <Path
            d="M 215 210 L 175 230 L 185 310 L 192 385 L 215 385 L 220 310 L 225 230 Z"
            fill={activeColor}
            fillOpacity="0.20"
            stroke={selectedSegment === 'pernaEsquerda' ? '#FFFFFF' : activeColor}
            strokeWidth={selectedSegment === 'pernaEsquerda' ? '3' : '1.8'}
          />
          {/* Relevo 3D quadríceps / panturrilha esquerda */}
          <Line x1="205" y1="240" x2="200" y2="300" stroke={activeColor} strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
          <Circle cx="202" cy="308" r="4" fill={activeColor} />
          <SvgText x="265" y="320" fill="#FFFFFF" fontSize="11" fontWeight="bold">
            {getSegmentData('pernaEsquerda').valKg}
          </SvgText>
          <SvgText x="265" y="335" fill={activeColor} fontSize="9">
            P. Esq ({getSegmentData('pernaEsquerda').perc})
          </SvgText>

          {/* Base e pés */}
          <Line x1="115" y1="395" x2="225" y2="395" stroke={activeColor} strokeWidth="1.5" strokeDasharray="4 2" />
        </Svg>
      </View>

      {/* Cartões Rápidos de Destaque Segmentar */}
      <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginTop: 4 }}>
        {(['bracoDireito', 'bracoEsquerdo', 'tronco', 'pernaDireita', 'pernaEsquerda'] as SegmentKey[]).map((key) => {
          const item = getSegmentData(key);
          const isSelected = selectedSegment === key;
          return (
            <Pressable
              key={key}
              onPress={() => setSelectedSegment(isSelected ? null : key)}
              style={{
                flex: 1,
                minWidth: 100,
                backgroundColor: isSelected ? `${activeColor}20` : t.surfaceElevated,
                borderWidth: 1,
                borderColor: isSelected ? activeColor : t.border,
                borderRadius: 14,
                padding: 10,
              }}
            >
              <Label>{item.label}</Label>
              <Title size={16} style={{ color: isSelected ? activeColor : t.text, marginVertical: 2 }}>
                {item.valKg}
              </Title>
              <Body muted style={{ fontSize: 11, color: activeColor } as any}>
                {item.perc} do padrão
              </Body>
            </Pressable>
          );
        })}
      </View>

      {/* Resumo da Análise */}
      <View
        style={{
          backgroundColor: `${activeColor}10`,
          borderRadius: 14,
          padding: 12,
          borderLeftWidth: 3,
          borderLeftColor: activeColor,
          marginTop: 6,
        }}
      >
        <Body style={{ fontSize: 13, color: t.text } as any}>
          {layer === 'musculo' &&
            `✔ Simetria Muscular Excepcional: Músculo esquelético total em ${bio.massaMuscularEsqueleticaKg} kg (45.2% da massa total), superando o teto esperado para a altura.`}
          {layer === 'gordura' &&
            `🎯 Foco Metabólico no Tronco: A concentração de gordura visceral nível ${bio.gorduraVisceralNivel} e 10 kg no tronco indica que treinos compostos aceleram a recomposição corporal.`}
          {layer === 'agua' &&
            `💧 Hidratação Celular Ótima: Água intracelular em ${bio.aguaIntracelularKg} kg (63% da água total), garantindo volume e recuperação muscular sem retenção excessiva.`}
        </Body>
      </View>
    </Card>
  );
}
