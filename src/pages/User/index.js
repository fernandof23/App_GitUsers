import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { ActivityIndicator } from 'react-native';
import api from '../../services/api';

import {
    Container,
    Header,
    Avatar,
    Name,
    Bio,
    Stars,
    Starred,
    OwnerAvatar,
    Info,
    Title,
    Author,
    Load,
} from './styles';

export default class User extends Component {
    static navigationOptions = ({ navigation }) => ({
        title: navigation.getParam('user').name,
    });

    static propTypes = {
        navigation: PropTypes.shape({
            getParam: PropTypes.func,
            navigate: PropTypes.func,
        }).isRequired,
    };

    state = {
        stars: [],
        loading: true,
        page: 1,
        nextLoad: false,
        refreshing: false,
    };

    componentDidMount() {
        this.load();
    }

    load = async (page = 1) => {
        if (page >= 2) {
            this.setState({ nextLoad: true });
        }
        const { navigation } = this.props;
        const user = navigation.getParam('user');
        const { stars } = this.state;

        const response = await api.get(`/users/${user.login}/starred`, {
            params: {
                page,
            },
        });

        this.setState({
            stars: page >= 2 ? [...stars, ...response.data] : response.data,
            page,
            loading: false,
            refreshing: false,
            nextLoad: false,
        });
    };

    loadMore = () => {
        const { page } = this.state;
        const nextPage = page + 1;
        this.load(nextPage);
    };

    refreshList = () => {
        this.setState({
            refreshing: true,
            page: 0,
            loading: true,
            nextLoad: false,
            stars: [],
        });
        this.load();
    };

    handleNavigation = repository => {
        const { navigation } = this.props;
        navigation.navigate('Repository', { repository });
    };

    render() {
        const { stars, loading, nextLoad, refreshing } = this.state;
        const { navigation } = this.props;
        const user = navigation.getParam('user');
        return (
            <Container>
                <Header>
                    <Avatar source={{ uri: user.avatar }} />
                    <Name>{user.name}</Name>
                    <Bio>{user.bio}</Bio>
                </Header>
                {loading ? (
                    <Load>
                        <ActivityIndicator size={100} color="#7139c1" />
                    </Load>
                ) : (
                    <Stars
                        data={stars}
                        keyExtractor={star => String(star.id)}
                        onEndReachedThreshold={0.2}
                        onEndReached={this.loadMore}
                        onRefresh={this.refreshList}
                        refreshing={refreshing}
                        renderItem={({ item }) => (
                            <Starred
                                onPress={() => this.handleNavigation(item)}
                            >
                                <OwnerAvatar
                                    source={{ uri: item.owner.avatar_url }}
                                />
                                <Info>
                                    <Title>{item.name}</Title>
                                    <Author>{item.owner.login}</Author>
                                </Info>
                            </Starred>
                        )}
                    />
                )}
                {nextLoad ? <ActivityIndicator /> : <></>}
            </Container>
        );
    }
}
