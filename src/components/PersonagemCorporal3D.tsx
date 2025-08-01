import React from 'react';

interface Personagem3DProps {
  genero: 'masculino' | 'feminino';
  altura?: number;
  peso?: number;
  className?: string;
  style?: React.CSSProperties;
}

const PersonagemCorporal3D: React.FC<Personagem3DProps> = ({ 
  genero, 
  altura, 
  peso, 
  className = "",
  style = {}
}) => {
  // URLs diretas dos embeds do Sketchfab fornecidos
  const embedUrls = {
    feminino: 'https://sketchfab.com/models/fe2c95ec93714e729becd46b2c37d3bb/embed',
    masculino: 'https://sketchfab.com/models/ebae6cc235c144cea4d46b3105f868a6/embed'
  };

  // Configurações fixas - sem controles 3D
  const fixedControls = {
    ui_controls: 0,
    ui_infos: 0,
    ui_inspector: 0,
    ui_stop: 0,
    ui_watermark: 0,
    ui_watermark_link: 0,
    ui_ar: 0,
    ui_help: 0,
    ui_settings: 0,
    ui_vr: 0,
    ui_fullscreen: 0,
    ui_animations: 0,
    ui_start: 0,
    ui_logo: 0,
    ui_author: 0,
    ui_license: 0,
    ui_embed: 0,
    ui_share: 0,
    ui_download: 0,
    ui_export: 0,
    ui_print: 0,
    ui_screenshot: 0,
    autostart: 1,
    autospin: 0.3, // Rotação lenta fixa
    camera: 0,
    scale: 1,
    fov: 45,
    pitch: 0,
    yaw: 0,
    roll: 0,
    x: 0,
    y: 1.5, // Posição fixa para cortar os pés
    z: 0
  };

  // Gerar URL com parâmetros fixos
  const buildEmbedUrl = () => {
    const baseUrl = embedUrls[genero];
    const params = new URLSearchParams();
    
    Object.entries(fixedControls).forEach(([key, value]) => {
      params.append(key, value.toString());
    });
    
    return `${baseUrl}?${params.toString()}`;
  };

  const embedUrl = buildEmbedUrl();

  return (
    <div 
      className={`relative ${className}`} 
      style={{
        ...style,
        height: '700px',
        width: '100%',
        overflow: 'visible',
        borderRadius: '12px'
      }}
    >
      {/* Medidas corporais */}
      {altura && (
        <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-sm font-semibold text-foreground bg-background/90 px-2 py-1 rounded-md border z-10">
          {altura} cm
        </div>
      )}
      
      {peso && (
        <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-sm font-semibold text-foreground bg-background/90 px-2 py-1 rounded-md border z-10">
          {peso.toFixed(1)} kg
        </div>
      )}
      
      {/* iframe do modelo 3D - FIXO */}
      <iframe
        key={embedUrl}
        title={genero === 'masculino' ? 'Personagem Masculino 3D' : 'Personagem Feminino 3D'}
        src={embedUrl}
        frameBorder="0"
        allowFullScreen
        allow="autoplay; fullscreen; xr-spatial-tracking"
        className="w-full h-full rounded-xl"
        style={{ 
          height: '700px',
          background: 'transparent'
        }}
      />
    </div>
  );
};

export default PersonagemCorporal3D;