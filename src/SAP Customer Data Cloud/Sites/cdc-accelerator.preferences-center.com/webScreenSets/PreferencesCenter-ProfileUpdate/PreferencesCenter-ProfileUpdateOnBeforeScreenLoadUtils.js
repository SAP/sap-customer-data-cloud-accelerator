import utils from '../utils/utils'

export default {
    blocklist: utils.getConfigPreferencesCenter('blocklist', []),

    filterBlocklist(subscriptions) {
        return subscriptions.filter((subscription) => {
            // Ignore subscriptions with RG
            if (subscription.key.indexOf('RG') !== -1) {
                return false
            }

            // Ignore subscriptions in blocklist
            if (this.blocklist.includes(subscription.key)) {
                return false
            }

            return true
        })
    },

    groupSubscriptionsByBrand(subscriptions) {
        return subscriptions.reduce((acc, subscription) => {
            const { brandName } = subscription

            const index = acc.findIndex((subscriptionGroup) => subscriptionGroup.brandName === brandName)

            if (-1 === index) {
                acc.push({ brandName, subscriptions: [subscription] })
            } else {
                acc[index].subscriptions.push(subscription)
            }

            return acc
        }, [])
    },

    // Filter out brands where the user is not subscribed to any of the subscriptions
    filterSubscribedBrands(groupedSubscriptions) {
        return groupedSubscriptions.reduce((acc, groupedSubscription) => {
            const isUserRegistered = groupedSubscription.subscriptions.some((subscription) => subscription.isUserRegistered)

            if (isUserRegistered) {
                acc.push(groupedSubscription)
            }

            return acc
        }, [])
    },

    moveNestleSubscriptionsToTop(subscriptions) {
        const nestleNameFragments = ['nestle', 'nestlé']

        const nestleSubscriptions = subscriptions.filter((subscription) => {
            return nestleNameFragments.some(function (v) {
                return subscription.brandName.toLowerCase().indexOf(v) >= 0
            })
        })

        const otherSubscriptions = subscriptions.filter((subscription) => {
            return nestleNameFragments.every(function (v) {
                return subscription.brandName.toLowerCase().indexOf(v) === -1
            })
        })

        // return [...nestleSubscriptions, ...otherSubscriptions] // ES6 version not used, to not generate extra helper functions
        nestleSubscriptions.push.apply(nestleSubscriptions, otherSubscriptions)
        return nestleSubscriptions
    },

    getSubscriptionFromDescription(description) {
        let subscription = { brandName: '', description: '' }

        if (!description) {
            return subscription
        }

        const splitDescription = description.trim().split('::')
        if (splitDescription.length !== 2) {
            return subscription
        }

        subscription = { brandName: splitDescription[0], description: splitDescription[1] }

        return subscription
    },

    getGroupedSubscriptionList({ schemaSubscriptions = [], userSubscriptions = [] } = {}) {
        let subscriptionList = Object.keys(schemaSubscriptions)
            .map((key) => {
                const value = schemaSubscriptions[key]

                const { brandName, description } = this.getSubscriptionFromDescription(value.email.description)
                if (!brandName || !description) {
                    return null
                }

                return {
                    key: key,
                    brandName,
                    description,
                    isSubscribed: userSubscriptions[key] ? userSubscriptions[key].email.isSubscribed : false,
                    isUserRegistered: userSubscriptions[key] ? true : false,
                }
            })
            .filter((subscription) => !!subscription)

        // Filter out subscriptions with RG and blocklisted subscriptions
        subscriptionList = this.filterBlocklist(subscriptionList)

        // Move Nestlé subscriptions to top
        subscriptionList = this.moveNestleSubscriptionsToTop(subscriptionList)

        // Group subscriptions by brand
        let groupedSubscriptions = this.groupSubscriptionsByBrand(subscriptionList)

        // Filter out brands where the user is not subscribed to any of the subscriptions
        groupedSubscriptions = this.filterSubscribedBrands(groupedSubscriptions)

        return groupedSubscriptions
    },

    setAttributes(element, attributes) {
        Object.keys(attributes).forEach((attr) => element.setAttribute(attr, attributes[attr]))
    },

    createSubscriptionHeader({ text, container }) {
        //create header for Brand
        let brandHeader = document.createElement('h3')
        this.setAttributes(brandHeader, { class: 'preferences-center-category-header' })

        brandHeader.append(document.createTextNode(text))
        container.append(brandHeader)
    },

    createSubscriptionField({ key, isSubscribed, description, container }) {
        // div for the toggle
        let buttonContainer = document.createElement('div')
        this.setAttributes(buttonContainer, { class: 'btn-container' })

        // button text container
        var buttonStatusText = document.createElement('span')
        buttonStatusText.className = 'gigya-label-text gigya-checkbox-text preferences-center-subscription-span subUnsub'
        buttonContainer.appendChild(buttonStatusText)

        //div for the checkbox
        let textContainer = document.createElement('div')
        this.setAttributes(textContainer, { class: 'toggle-container' })

        let label = document.createElement('label')
        this.setAttributes(label, { class: 'preferences-center-subscription-label toggle' })
        label.appendChild(buttonContainer)

        //checkbox input
        let checkbox = document.createElement('input')
        const checkboxName = `subscriptions.${key}.email.isSubscribed`
        this.setAttributes(checkbox, {
            class: 'preferences-center-subscription-checkbox toggle-checkbox',
            type: 'checkbox',
            name: checkboxName,
        })
        textContainer.appendChild(checkbox)

        let toggleDiv = document.createElement('div')
        this.setAttributes(toggleDiv, { class: 'toggle-switch', name: checkboxName })

        textContainer.appendChild(toggleDiv)
        let span = document.createElement('span')
        this.setAttributes(span, { class: 'gigya-label-text gigya-checkbox-text preferences-center-subscription-span toggle-label', name: checkboxName })
        span.appendChild(document.createTextNode(description))
        textContainer.appendChild(span)

        label.appendChild(textContainer)
        container.appendChild(label)
    },

    createSubscriptionList({ groupedSubscriptions, container }) {
        // If already loaded, don't load again
        if (container.querySelectorAll('.preferences-center-subscriptions-list').length > 0) {
            return
        }

        const preferencesCenterContainer = document.createElement('div')
        preferencesCenterContainer.classList.add('preferences-center-subscriptions-list')

        // Loop brands to create headers and fields
        groupedSubscriptions.forEach(({ brandName, subscriptions }) => {
            // Create header
            this.createSubscriptionHeader({ text: brandName, container: preferencesCenterContainer })

            // Create subscription fields
            subscriptions.forEach((subscription) => {
                this.createSubscriptionField({
                    key: subscription.key,
                    isSubscribed: subscription.isSubscribed,
                    description: subscription.description,
                    container: preferencesCenterContainer,
                })
            })
        })

        container.appendChild(preferencesCenterContainer)
    },

    hidePreferencesCenterButtons() {
        const options = document.getElementsByClassName('pref-center-check-options')
        const intro = document.getElementsByClassName('pref-center-intro')
        if (options.length) {
            options[0].style.display = 'none'
        }
        if (intro.length) {
            intro[0].style.display = 'none'
        }
    },
}
