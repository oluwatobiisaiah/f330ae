import { Handle, Position } from '@xyflow/react'
import DescriptionIcon from '@mui/icons-material/Description'

export default function FormNode({ data }: { data: any }) {
  
  return (
<div className="form-node">
      <div className="form-node-content">
        <div className="form-node-header">
          <div className="form-node-icon">
            <DescriptionIcon fontSize="medium" />
          </div>
          <div className="form-node-text">
            <div className="form-node-label">Form</div>
            <div className="form-node-title">{data.name}</div>
          </div>
        </div>
      </div>
      <Handle 
        type="target" 
        position={Position.Left} 
        className="form-node-handle form-node-handle-target" 
      />
      <Handle 
        type="source" 
        position={Position.Right} 
        className="form-node-handle form-node-handle-source" 
      />
    </div>
  )
}
