import PropTypes from 'prop-types'
import React, {Component} from 'react'
import withStyles from 'universal/styles/withStyles'
import {css} from 'aphrodite-local-styles/no-important'
import appTheme from 'universal/styles/theme/appTheme'
import makePlaceholderStyles from 'universal/styles/helpers/makePlaceholderStyles'
import Icon from 'universal/components/Icon'
import {MD_ICONS_SIZE_18} from 'universal/styles/icons'

class Editable extends Component {
  constructor (props) {
    super(props)
    this.state = {
      isEditing: false
    }
  }

  setEditing = () => {
    this.setState({
      isEditing: true
    })
  }

  unsetEditing = () => {
    const {input, untouch} = this.props
    this.setState({
      isEditing: false
    })
    input.onBlur()
    if (untouch) {
      untouch(input.name)
    }
  }

  renderEditing = () => {
    const {
      handleSubmit,
      input,
      maxLength,
      meta: {dirty, error, touched},
      placeholder,
      styles,
      submitOnBlur,
      touch
    } = this.props
    const inputStyles = css(styles.static, styles.input)

    const submitAndSet = async (e) => {
      e.preventDefault()
      const didSubmit = await handleSubmit()
      if (!didSubmit) {
        this.unsetEditing()
      }
    }
    const maybeSubmitOnBlur = (e) => {
      if (touch) {
        touch(input.name)
      }
      if (submitOnBlur) {
        submitAndSet(e)
      } else if (!input.value || (!error && !dirty)) {
        this.unsetEditing()
      }
    }
    return (
      <form onSubmit={submitAndSet}>
        <input
          {...input}
          autoFocus
          className={inputStyles}
          maxLength={maxLength}
          onBlur={maybeSubmitOnBlur}
          placeholder={placeholder}
        />
        {touched && error && <div className={css(styles.error)}>{error}</div>}
      </form>
    )
  }

  renderStatic = () => {
    const {hideIconOnValue, icon, initialValue, placeholder, styles} = this.props
    const staticStyles = css(styles.static, !initialValue && styles.placeholder)

    const hideIcon = initialValue && hideIconOnValue
    return (
      <div className={css(styles.staticBlock)} onClick={this.setEditing}>
        <div className={staticStyles}>{initialValue || placeholder}</div>
        {!hideIcon && <Icon className={css(styles.icon)}>{icon || 'edit'}</Icon>}
      </div>
    )
  }

  render () {
    const {styles} = this.props
    return (
      <div className={css(styles.editableRoot)}>
        {this.state.isEditing ? this.renderEditing() : this.renderStatic()}
      </div>
    )
  }
}

Editable.propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  // NOTE: Use 'hideIconOnValue' when you want to hide
  //       the pencil icon when there is a value. (TA)
  hideIconOnValue: PropTypes.bool,
  icon: PropTypes.string,
  input: PropTypes.shape({
    name: PropTypes.string,
    onBlur: PropTypes.func,
    onChange: PropTypes.func,
    onFocus: PropTypes.func,
    type: PropTypes.string,
    value: PropTypes.string
  }),
  initialValue: PropTypes.string,
  isEditing: PropTypes.bool,
  maxLength: PropTypes.number,
  meta: PropTypes.object,
  placeholder: PropTypes.string,
  styles: PropTypes.object,
  submitOnBlur: PropTypes.bool,
  typeStyles: PropTypes.shape({
    color: PropTypes.string.isRequired,
    fontSize: PropTypes.string.isRequired,
    lineHeight: PropTypes.string.isRequired,
    placeholderColor: PropTypes.string.isRequired
  }),
  touch: PropTypes.func,
  untouch: PropTypes.func
}

const styleThunk = (custom, {typeStyles}) => ({
  editableRoot: {
    display: 'block',
    lineHeight: typeStyles.lineHeight,
    width: '100%'
  },

  error: {
    color: appTheme.palette.warm,
    fontSize: '.85rem'
  },

  staticBlock: {
    display: 'inline-block',
    fontSize: 0,
    lineHeight: typeStyles.lineHeight,
    verticalAlign: 'top',

    ':hover': {
      cursor: 'pointer',
      opacity: '.5'
    }
  },

  static: {
    color: typeStyles.color,
    display: 'inline-block',
    fontSize: typeStyles.fontSize,
    lineHeight: typeStyles.lineHeight,
    verticalAlign: 'middle'
  },

  placeholder: {
    color: typeStyles.placeholderColor
  },

  icon: {
    color: appTheme.palette.dark,
    display: 'inline-block !important',
    fontSize: `${MD_ICONS_SIZE_18} !important`,
    marginLeft: '.375rem',
    verticalAlign: 'middle !important'
  },

  input: {
    appearance: 'none',
    backgroundColor: 'transparent',
    border: 0,
    borderRadius: 0,
    display: 'inline-block',
    fontFamily: 'inherit',
    outline: 'none',
    padding: 0,
    verticalAlign: 'top',
    width: '100%',

    ...makePlaceholderStyles(typeStyles.placeholderColor)
  }
})

export default withStyles(styleThunk)(Editable)
