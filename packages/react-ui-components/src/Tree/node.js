import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import {DragSource, DropTarget} from 'react-dnd';
import omit from 'lodash.omit';
import mergeClassNames from 'classnames';

const spec = {
    canDrop({dragAndDropContext, mode}) {
        return dragAndDropContext.accepts(mode || 'into');
    },
    drop({dragAndDropContext, mode}) {
        dragAndDropContext.onDrop(mode || 'into');
    }
};

const collect = (connect, monitor) => ({
    connectDropTarget: connect.dropTarget(),
    canDrop: monitor.canDrop(),
    isOver: monitor.isOver()
});

export class Node extends PureComponent {
    static propTypes = {
        children: PropTypes.node
    };

    render() {
        const {children, ...restProps} = this.props;
        const rest = omit(restProps, ['theme']);

        return (
            <div {...rest}>
                {children}
            </div>
        );
    }
}

@DropTarget(({nodeDndType}) => nodeDndType, spec, collect)
class NodeDropTarget extends PureComponent {
    static propTypes = {
        connectDropTarget: PropTypes.func.isRequired,
        nodeDndType: PropTypes.string.isRequired,
        canDrop: PropTypes.bool.isRequired,
        isOver: PropTypes.bool,
        theme: PropTypes.object,
        mode: PropTypes.string.isRequired
    };
    render() {
        const {connectDropTarget, isOver, mode, theme} = this.props;
        const classNames = mergeClassNames({
            [theme.dropTarget]: true,
            [theme['dropTarget--before']]: mode === 'before',
            [theme['dropTarget--after']]: mode === 'after'
        });
        const classNamesInner = mergeClassNames({
            [theme.dropTarget__inner]: true,
            [theme['dropTarget__inner--acceptsDrop']]: isOver
        });
        return connectDropTarget(
            <div className={classNames}>
                <div className={classNamesInner}/>
            </div>
        );
    }
}

@DragSource(({nodeDndType}) => nodeDndType, {
    beginDrag(props) {
        props.dragAndDropContext.onDrag();
        return {
            contextPath: props.id
        };
    }
}, (connect, monitor) => ({
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging()
}))
@DropTarget(({nodeDndType}) => nodeDndType, spec, collect)
export class Header extends PureComponent {
    static propTypes = {
        id: PropTypes.string,
        nodeDndType: PropTypes.string.isRequired,
        hasChildren: PropTypes.bool.isRequired,
        isLastChild: PropTypes.bool,
        isCollapsed: PropTypes.bool.isRequired,
        isActive: PropTypes.bool.isRequired,
        isFocused: PropTypes.bool.isRequired,
        isLoading: PropTypes.bool.isRequired,
        isHidden: PropTypes.bool,
        isDirty: PropTypes.bool,
        isHiddenInIndex: PropTypes.bool,
        hasError: PropTypes.bool.isRequired,
        label: PropTypes.string.isRequired,
        icon: PropTypes.string,
        dragAndDropContext: PropTypes.shape({
            accepts: PropTypes.func.isRequired,
            onDrag: PropTypes.func.isRequired,
            onDrop: PropTypes.func.isRequired
        }),
        connectDragSource: PropTypes.func.isRequired,
        connectDropTarget: PropTypes.func.isRequired,
        canDrop: PropTypes.bool.isRequired,
        isDragging: PropTypes.bool,
        isOver: PropTypes.bool,

        onToggle: PropTypes.func,
        onClick: PropTypes.func,
        onLabelClick: PropTypes.func,
        theme: PropTypes.shape({/* eslint-disable quote-props */
            'header__data': PropTypes.string,
            'header__data--isActive': PropTypes.string,
            'header__data--isFocused': PropTypes.string,
            'header': PropTypes.string,
            'header__label': PropTypes.string,
            'header__chevron': PropTypes.string,
            'header__chevron--isCollapsed': PropTypes.string,
            'header__chevron--isLoading': PropTypes.string,
            'header__icon': PropTypes.string,
            'dropZone': PropTypes.string,
            'dropZone--accepts': PropTypes.string,
            'dropZone--denies': PropTypes.string
        }).isRequired, /* eslint-enable quote-props */

        //
        // Static component dependencies which are injected from the outside (index.js)
        //
        IconComponent: PropTypes.any.isRequired
    };

    render() {
        const {
            id,
            nodeDndType,
            IconComponent,
            hasChildren,
            isLastChild,
            isActive,
            isFocused,
            isHidden,
            isHiddenInIndex,
            isDirty,
            label,
            icon,
            onClick,
            onLabelClick,
            theme,
            connectDragSource,
            connectDropTarget,
            dragAndDropContext,
            isOver,
            isDragging,
            canDrop,
            ...restProps
        } = this.props;
        const rest = omit(restProps, ['onToggle', 'isCollapsed', 'isLoading', 'hasError', 'isDragging']);
        const dataClassNames = mergeClassNames({
            [theme.header__data]: true,
            [theme['header__data--isActive']]: isActive,
            [theme['header__data--isFocused']]: isFocused,
            [theme['header__data--isLastChild']]: isLastChild,
            [theme['header__data--isHiddenInIndex']]: isHiddenInIndex,
            [theme['header__data--isHidden']]: isHidden,
            [theme['header__data--isDirty']]: isDirty,
            [theme['header__data--isDragging']]: isDragging,
            [theme['header__data--acceptsDrop']]: isOver && canDrop,
            [theme['header__data--deniesDrop']]: isOver && !canDrop
        });

        return connectDragSource(
            <div>
                <div className={theme.header}>
                    {hasChildren ? this.renderCollapseControl() : null}
                    <NodeDropTarget
                        id={id}
                        theme={theme}
                        dragAndDropContext={dragAndDropContext}
                        nodeDndType={nodeDndType}
                        mode="before"
                        />
                    {connectDropTarget(
                        <div
                            role="button"
                            className={dataClassNames}
                            onClick={onClick}
                            >
                            <IconComponent icon={icon || 'question'} padded="right" role="button" className={theme.header__icon}/>
                            <span {...rest} className={theme.header__label} role="button" onClick={onLabelClick} data-neos-integrational-test="tree__item__nodeHeader__itemLabel">
                                {label}
                            </span>
                        </div>
                    )}
                    {isLastChild && (
                        <NodeDropTarget
                            id={id}
                            theme={theme}
                            dragAndDropContext={dragAndDropContext}
                            nodeDndType={nodeDndType}
                            mode="after"
                            />
                    )}
                </div>
            </div>
        );
    }

    renderCollapseControl() {
        const {
            IconComponent,
            isLoading,
            isCollapsed,
            hasError,
            isHiddenInIndex,
            isHidden,
            onToggle,
            theme
        } = this.props;
        const classnames = mergeClassNames({
            [theme.header__chevron]: true,
            [theme['header__chevron--isCollapsed']]: isCollapsed,
            [theme['header__chevron--isLoading']]: isLoading,
            [theme['header__chevron--isHiddenInIndex']]: isHiddenInIndex,
            [theme['header__chevron--isHidden']]: isHidden
        });
        let icon;

        switch (true) {
            case hasError:
                icon = <IconComponent icon="ban"/>;
                break;
            case isLoading:
                icon = <IconComponent icon="spinner" spin={true}/>;
                break;
            default:
                icon = <IconComponent icon="sort-desc"/>;
                break;
        }

        return (
            <a role="button" onClick={onToggle} className={classnames} data-neos-integrational-test="tree__item__nodeHeader__subTreetoggle">
                {icon}
            </a>
        );
    }
}

export class Contents extends PureComponent {
    static propTypes = {
        children: PropTypes.node,
        theme: PropTypes.shape({/* eslint-disable quote-props */
            'contents': PropTypes.string
        }).isRequired/* eslint-enable quote-props */
    };

    render() {
        const {theme, children} = this.props;

        return (
            <div className={theme.contents}>
                {children}
            </div>
        );
    }
}

export default Node;
