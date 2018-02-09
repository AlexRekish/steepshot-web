import React from 'react';
import {connect} from "react-redux";
import {pageLoaded, setActiveIndex} from "../../../actions/tabsBar";
import LoadingSpinner from "../../LoadingSpinner";
import Constants from "../../../common/constants";
import ShowIf from "../ShowIf";

class TabsBar extends React.Component {
  static defaultProps = {
    className: ''
  };

  constructor(props) {
    super(props);
  }

  componentDidUpdate() {
    let navItems = [];
    this.props.children.forEach((item, index) => {
      if (item.props.loading || !item.props.empty) {
        navItems.push(index);
      }
      if (!this.props.pageLoaded && !item.props.loading && this.props.activeIndex === index) {
        this.props.pageIsLoaded(this.props.point);
      }
    });
    if (navItems.length === 1) {
      let itemIndex = navItems[0];
      if (this.props.activeIndex !== itemIndex) {
        this.props.setActiveIndex(this.props.point, itemIndex);
      }
    }
  }

  renderNavigation() {
    let navItems = [];
    this.props.children.forEach((item, index) => {
      let styles = 'nav-item';
      if (this.props.activeIndex === index) {
        styles = 'nav-item active';
      }
      if (!item.props.loading && !item.props.empty || this.props.activeIndex === index) {
        navItems.push(
          <li role="presentation" key={index} className={styles}>
            <a onClick={() => this.props.setActiveIndex(this.props.point, index)}
               className="nav-link tab-head">
              {item.props.name}
            </a>
          </li>
        );
      }
    });
    if (navItems.length === 1) {
      return null;
    }
    return (
      <ul role="tablist" className="nav nav-tabs list-reset">
        {navItems}
      </ul>);
  }

  renderChildren() {
    let allChildrenHide = true;
    let children = [];
    this.props.children.forEach((child, index) => {
      if (!child.props.empty || child.props.loading) {
        allChildrenHide = false;
      }
      children.push(
        React.cloneElement(child, {
          ...child.props,
          key: index,
          point: this.props.point,
          index
        }));
    });
    if (allChildrenHide) {
      return (
        <div className="empty-query-message">
          {Constants.EMPTY_QUERY}
        </div>);
    }
    return children;
  }

  render() {
    return (
      <div className={"clearfix" + this.props.className}>
        {this.renderNavigation()}
        {this.renderChildren()}
        <ShowIf show={!this.props.pageLoaded}>
          <LoadingSpinner style={{height: '100%', position: 'absolute'}}/>
        </ShowIf>
      </div>
    );
  }
}

const mapStateToProps = (state, props) => {
  return {
    ...state.tabsBar[props.point],
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    setActiveIndex: (point, index) => {
      dispatch(setActiveIndex(point, index));
    },
    pageIsLoaded: (point) => {
      dispatch(pageLoaded(point));
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(TabsBar);
