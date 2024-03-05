import { faBoltLightning, faBoxOpen, faCircleNotch, faGift, faUserGroup } from '@fortawesome/free-solid-svg-icons';
import './header.scss';
import IconLink from './iconlink';
import Drawer from './responsiveDrawer';

export default function Header() {
    return (
        <div className="header" style={{position: "fixed"}}>
            <IconLink className="logo" to="/">QIAO</IconLink>
            <div style={{
                height: "100%",
                width: "1px",
                background: "rgba(255, 255, 255, 0.5)",
                margin: "0 0.75rem"
            }}></div>
            <Drawer className='links'>
                <IconLink className='link' to="/unboxing" icon={faBoxOpen}>UNBOXING</IconLink>
                <IconLink className='link' to="/pvp" icon={faBoltLightning}>BATTLES</IconLink>
                <IconLink className='link' to="/deals" icon={faCircleNotch}>DEALS</IconLink>
                <IconLink className='link' to="/affiliates" icon={faUserGroup}>AFFILIATES</IconLink>
                <IconLink className='link' to="/freedrop" icon={faGift}>FREE DROP</IconLink>
            </Drawer>
            <div className="account">
                <button className='signup'>SIGN UP</button>
                <button className='login'>LOGIN</button>
            </div>
        </div>
    );
}