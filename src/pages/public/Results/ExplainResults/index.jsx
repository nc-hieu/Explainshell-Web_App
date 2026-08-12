import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, Spin, Typography, Button, BorderBeam } from 'antd';
import { LockOutlined, UnlockOutlined, ArrowRightOutlined, SearchOutlined } from '@ant-design/icons';
import { programService } from '../../../../services/program.service';
import LiveSearchBar from '../../../../components/common/LiveSearchBar';
import DOMPurify from 'dompurify';
import { ReactFlow, Background, Controls, 
         Handle, Position, Panel, 
         useNodesState, useEdgesState } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import './ExplainResults.scss';
const { Title, Text } = Typography;

// --- BẢNG MÀU CHO TỪNG OPTION (mỗi option 1 màu riêng, giống explainShell) ---
const PALETTE = [
  '#e85d2f', '#1a8fe3', '#2fae5d', '#8c54d6',
  '#e0428f', '#0fa8a1', '#e0a015', '#4361ee',
];

// --- ĐO ĐỘ RỘNG CHỮ THẬT (để các token lệnh nối liền nhau như 1 dòng lệnh) ---
let _measureCanvas = null;
function measureTextWidth(text, font = '700 20px "JetBrains Mono", "Fira Code", monospace') {
  if (typeof document === 'undefined') return text.length * 12;
  if (!_measureCanvas) _measureCanvas = document.createElement('canvas');
  const ctx = _measureCanvas.getContext('2d');
  ctx.font = font;
  return ctx.measureText(text).width;
}

// --- ƯỚC LƯỢNG CHIỀU CAO THẺ GIẢI THÍCH DỰA TRÊN ĐỘ DÀI NỘI DUNG ---
function estimateCardHeight(html) {
  const plain = (html || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  const CARD_TEXT_WIDTH = 560; // px nội dung khả dụng trong thẻ
  const CHARS_PER_LINE = Math.floor(CARD_TEXT_WIDTH / 7.2); // ước lượng font body ~14px
  const lines = Math.max(1, Math.ceil(plain.length / CHARS_PER_LINE));
  const HEADER_H = 54;
  const LINE_H = 22;
  const PADDING = 40;
  return Math.min(420, Math.max(140, HEADER_H + PADDING + lines * LINE_H));
}

// --- 1. CÁC NÚT TÙY CHỈNH ---

// Token của dòng lệnh: chữ + gạch chân màu, giống cách explainShell highlight từng phần lệnh
const CommandNode = ({ data }) => (
  <div
    className="commandNode"
    style={{borderBottom: `4px solid ${data.color}`}}
  >
    {data.label}
    <Handle
      type="source"
      position={Position.Bottom}
      className="commandNode__handle"
      style={{ background: data.color}}
    />
  </div>
);

// Thẻ giải thích, có chấm màu + thanh màu bên trái khớp với token tương ứng
const ExplanationNode = ({ data }) => (
  <div
    className="explanationNode"
    style={{borderLeft: `5px solid ${data.color}`}}
  >
    <Handle
      type="target"
      position={Position.Left}
      style={{ background: data.color, border: 'none', width: 8, height: 8 }}
    />
    {typeof data.onViewDetail === 'function'? (
      <BorderBeam
        lineWidth={2}
        size={200}
        style={{borderRadius: '10px'}}
        color = {[
          { color: '#2f54eb ', percent: 0 },
          { color: '#722ed1 ', percent: 44 },
          { color: '#ff85c0 ', percent: 100 },
        ]}>
          <div className="explanationNode__cardHeader">
          <div className="explanationNode__cardHeader--title">
            <span
            className="explanationNode__cardHeader--titleDot"
            style={{background: data.color}}
            />
            <span className="explanationNode__cardHeader--titleName">
            {data.title}
            </span>
          </div>

        {typeof data.onViewDetail === 'function' && (
            <div className="button__getToDetail">
            <Button
            size="small"
            type="link"
            onClick={data.onViewDetail}
            >
                Xem chi tiết {data.onViewDetail}<ArrowRightOutlined />
            </Button>
            </div>
          )}
        </div>
      </BorderBeam>
      ) : (
      <div className="explanationNode__cardHeader">
        <div className="explanationNode__cardHeader--title">
        <span
          className="explanationNode__cardHeader--titleDot"
          style={{background: data.color}}
          />
            <span className="explanationNode__cardHeader--titleName">
              {data.title}
            </span>
        </div>

        {typeof data.onViewDetail === 'function' && (
          <div className="button__getToDetail">
            <Button
              size="small"
              type="link"
              onClick={data.onViewDetail}
            >
              Xem chi tiết {data.onViewDetail}<ArrowRightOutlined />
            </Button>
          </div>)}
        </div>
    )}
    
    <div
      className="tiptap-content"
      dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(data.description) }}
    />
  </div>
);

const nodeTypes = {
  command: CommandNode,
  explanation: ExplanationNode,
};

// --- 2. COMPONENT CHÍNH ---
const ExplainResults = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const keyword = searchParams.get('q') || '';
  const [explainData, setExplainData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [locked, setLocked] = useState(true);

  useEffect(() => {
    if (keyword) {
      fetchCommandExplanation();
    }
  }, [keyword]);

  const fetchCommandExplanation = async () => {
    setLoading(true);
    try {
      const data = await programService.explain(keyword);
      setExplainData(data);
    } catch (error) {
      setExplainData(null);
    } finally {
      setLoading(false);
    }
  };

// 1. Khai báo state quản lý nodes và edges
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [canvasHeight, setCanvasHeight] = useState(6000);

  // 2. Cập nhật nodes và edges mỗi khi explainData thay đổi
  useEffect(() => {
    if (!explainData || !explainData.program) return;

    const newNodes = [];
    const newEdges = [];

    const COMMAND_Y = 40;
    const CARD_X = 60;
    const TOKEN_GAP = 22;
    const CARD_GAP_Y = 36;

    let cursorX = 60;
    let cursorY = 200; 

    const mainColor = 'var(--color-primary, #e85d2f)';
    const mainLabel = explainData.program.name;
    const mainWidth = measureTextWidth(mainLabel);

    // --- Command ---
    newNodes.push({
      id: 'cmd-main',
      type: 'command',
      position: { x: cursorX, y: COMMAND_Y },
      data: { label: mainLabel, color: mainColor },
      // XÓA: draggable: false
    });

    newNodes.push({
      id: 'desc-main',
      type: 'explanation',
      position: { x: CARD_X, y: cursorY },
      data: {
        title: mainLabel,
        description: explainData.program.description,
        color: mainColor,
        onViewDetail: () => navigate(`/programs/${explainData.program.slug}`),
      },
      // XÓA: draggable: false
    });

    newEdges.push({
      id: 'edge-main',
      source: 'cmd-main',
      target: 'desc-main',
      type: 'default',
      style: { stroke: mainColor, strokeWidth: 2.5 },
    });
    // --- END Command ---

    cursorX += mainWidth + TOKEN_GAP;
    cursorY += estimateCardHeight(explainData.program.description) + CARD_GAP_Y;

    // --- Option ---
    explainData.matched_options?.forEach((opt, index) => {
      const color = PALETTE[index % PALETTE.length];
      const label = opt.short_name || opt.long_name;
      const width = measureTextWidth(label);
      const cmdId = `cmd-opt-${opt.id}`;
      const descId = `desc-opt-${opt.id}`;

      newNodes.push({
        id: cmdId,
        type: 'command',
        position: { x: cursorX, y: COMMAND_Y },
        data: { label, color },
        // XÓA: draggable: false
      });

      newNodes.push({
        id: descId,
        type: 'explanation',
        position: { x: CARD_X, y: cursorY },
        data: {
          title: `${opt.short_name || ''}${opt.long_name ? `  |  ${opt.long_name}` : ''}`,
          description: opt.description,
          color,
        },
        // XÓA: draggable: false
      });

      newEdges.push({
        id: `edge-${opt.id}`,
        source: cmdId,
        target: descId,
        type: 'default',
        style: { stroke: color, strokeWidth: 2.5 },
      });

      cursorX += width + TOKEN_GAP;
      cursorY += estimateCardHeight(opt.description) + CARD_GAP_Y;
    });

    // 3. Set vào State
    setNodes(newNodes);
    setEdges(newEdges);
    setCanvasHeight(Math.max(600, cursorY + 80));
    
  }, [explainData, setNodes, setEdges, navigate]); // Thêm dependencies

  return (
    <div className="explainPage">
      <LiveSearchBar size="large" className="custom-search-bar" initialValue={keyword} />

      {loading ? (
        <div className="loadding" >
          <Spin size="large" tip={`Đang phân tích lệnh "${keyword}"...`} />
        </div>
      ) : explainData && explainData.program ? (
        <div className="resultBox" style={{height: canvasHeight}}>
          <BorderBeam
            lineWidth={2.5}
            size={500}
            color = {[
              { color: '#22c55e', percent: 0 },
              { color: '#a3e635', percent: 54 },
              { color: '#facc15', percent: 100 },
            ]}
            style={{borderRadius: '12px'}}
          >
            <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{ padding: 0.15, maxZoom: 1 }}
            nodesConnectable={false}
            panOnDrag={!locked}
            zoomOnScroll={!locked}
            zoomOnPinch={!locked}
            zoomOnDoubleClick={!locked}
            proOptions={{ hideAttribution: true }}
            nodesDraggable={locked ? false:true}
            >
            <Background color="#d8d8de" gap={20} size={1} />
              <Controls 
                showInteractive={false} 
                position='top-left'
                className="explainPage__controls"
              />
              <Panel position="top-right">
                <Button
                  icon={locked ? <LockOutlined /> : <UnlockOutlined />}
                  onClick={() => setLocked((prev) => !prev)}
                  shape="round"
                  className="button__lock"
                  style={{
                    borderColor: locked ? '#e85d2f' : undefined,
                    color: locked ? '#e85d2f' : undefined,
                  }}
                >
                  {locked ? 'Đã khóa thao tác' : 'Đã mở khóa'}
                </Button>
              </Panel>
            </ReactFlow>
          </BorderBeam>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Title level={3}>Ôi không! 😥</Title>
          <p>Hệ thống của chúng tôi chưa có dữ liệu cho lệnh: <Text type="danger">"{keyword}"</Text></p>
          <p>Chúng tôi sẽ cố gắng cập nhật sớm nhất có thể!</p>
        </div>
      )}
    </div>
  );
};

export default ExplainResults; 