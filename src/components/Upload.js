import React from 'react';
import {Input} from 'reactstrap';
function Upload(props) {


return (
	<>
	<Input type="file" id="imageid"  accept="image/png, image/jpeg" onChange={(e)=>{props.setImage(e.target.files[0])}}/>	
	</>
);
}

export default Upload;
